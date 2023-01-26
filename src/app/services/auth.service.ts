import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthEventType } from 'src/app/models/auth-event-types.enum';
import { Role } from '@model/role.model';
import * as AWS from "aws-sdk/global";
import { LoginsMap } from "aws-sdk/clients/cognitoidentity";
// import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { SHA256, enc, HmacSHA256 } from 'crypto-js';
import { CognitoIdentityCredentials } from 'aws-sdk/global';
import { HttpRequest } from '@angular/common/http';
import { AwsV4Signer } from 'aws4fetch';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.baseUrl;
  private ownerUserPool: CognitoUserPool;
  private frontDeskUserPool: CognitoUserPool;
  private isSignedInAsOwner: boolean = false;

  private eventSubject: Subject<AuthEventType> = new Subject();
  private curUser: CognitoUser | null = null;
  private curAwsCreds: CognitoIdentityCredentials | undefined;

  constructor() {
    this.ownerUserPool = new CognitoUserPool({
      ClientId: environment.ownerUserPoolClientId,
      UserPoolId: environment.ownerUserPoolId,
    });
    this.frontDeskUserPool = new CognitoUserPool({
      ClientId: environment.frontDeskUserPoolClientId,
      UserPoolId: environment.frontDeskUserPoolId
    });

    if (this.ownerUserPool.getCurrentUser() != null) {
      this.isSignedInAsOwner = true;
      this.curUser = this.ownerUserPool.getCurrentUser();
    } else if (this.frontDeskUserPool.getCurrentUser() != null) {
      this.curUser = this.frontDeskUserPool.getCurrentUser();
    }
  }

  signInAsOwner(username: string, password: string): Promise<CognitoUser> {
    return this._signIn(username, password, true);
  }

  signInAsFrontdesk(username: string, password: string): Promise<CognitoUser> {
    return this._signIn(username, password, false);
  }

  _signIn(username: string, password: string, asOwner: boolean): Promise<CognitoUser> {
    console.log(`Signing in user with username '${username}'`);
    const user = new CognitoUser({
      Pool: asOwner ? this.ownerUserPool : this.frontDeskUserPool,
      Username: username,
    });
    return new Promise((resolve, reject) => {
      user.authenticateUser(new AuthenticationDetails({
        Username: username,
        Password: password,
      }), {
        onSuccess: (session) => {
          console.log(`Successfull signed in with username '${username}' and session '${session}'`);
          this.isSignedInAsOwner = asOwner;
          this.curUser = user;
          this.eventSubject.next(AuthEventType.SIGNED_IN);
          resolve(user);
        },
        newPasswordRequired: function (userAttributes, requiredAttributes) {
          // https://stackoverflow.com/questions/40287012/how-to-change-user-status-force-change-password

          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // the api doesn't accept this field back
          delete userAttributes.email_verified;

          // unsure about this field, but I don't send this back
          delete userAttributes.phone_number_verified;

          // Get these details and call
          user.completeNewPasswordChallenge(password, userAttributes, this);
        },
        onFailure: (err) => {
          /* Possible err.code:
            UserNotFoundException: username not signed up yet
            NotAuthorizedException: wrong username/password
            UserNotConfirmedException: account is not verified yet by owner
            UsernameExistsException: username exists
          */
          console.error(err);
          reject(err);
        }
      });
    });
  }

  signOut(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const curUser = await this.getCurUser();
      if (!curUser) {
        reject('signOut(): User is not signed in');
        return;
      }

      curUser.signOut(() => {
        console.log('Sign out successfully');
        this.curUser = null;
        this.eventSubject.next(AuthEventType.SIGNED_OUT);
        resolve('success');
      });
    });
  }

  // async getCurUser(): Promise<CognitoUser | undefined> {
  //   const curUser = await this._getCurUser(true);
  //   return curUser ? curUser : await this._getCurUser(false);
  // }

  getCurUser(): Promise<CognitoUser | null> { //
    return new Promise((resolve, reject) => {
      if (!this.curUser) {
        console.log('getCurUser(): User not logged in');
        resolve(null);
        return;
      }
      this.curUser.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          console.log('getSession() error');
          resolve(null);
          return;
        }
        if (!session.isValid()) {
          console.log('Invalid session');
          resolve(null);
          return;
        }
        resolve(this.curUser);
      });
    });
  }

  async hasRole(role: Role) {
    const user = await this.getCurUser();
    if (!user) {
      return false;
    }
    if (role == Role.OWNER) {
      return user.getUsername() == 'owner'; // TODO: change this when creating new user in the pool
    }
    if (role == Role.FRONT_DESK) {
      return new Set([
        'frontdesk',
        'huypham'
      ]).has(user.getUsername()); // TODO: change this when creating new user in the pool
    }
    return false;
  }

  getAuthEventUpdates() {
    return this.eventSubject.asObservable();
  }

  async getAwsCredentials(): Promise<AWS.CognitoIdentityCredentials> {
    if (!this.curUser) {
      throw new Error('user not logged in');
    }

    if (this.curAwsCreds && this.curUser?.getSignInUserSession()?.getIdToken()) {
      const curJwtToken = this.curUser?.getSignInUserSession()?.getIdToken().getJwtToken();
      await this.getCurUser();
      const newJwtToken = this.curUser?.getSignInUserSession()?.getIdToken().getJwtToken();
      if (curJwtToken === newJwtToken) {
        console.log('same jwt');

        // Using cached creds
        if (this.curAwsCreds.needsRefresh()) {
          console.log('refreshing aws creds');
          await this.curAwsCreds.refreshPromise();
        }

        return this.curAwsCreds!;
      }
    }

    // Building new aws creds
    if (!this.curUser?.getSignInUserSession()?.getIdToken()?.getJwtToken()) {
      console.log('cur user does not have active session');
      await this.getCurUser();
    }

    console.log('user =', this.curUser);

    AWS.config.region = 'us-east-1';
    const url = `cognito-idp.us-east-1.amazonaws.com/${environment.ownerUserPoolId}`;
    const Logins = {} as LoginsMap;
    const idToken = this.curUser.getSignInUserSession()!.getIdToken();
    Logins[url] = idToken.getJwtToken();
    // console.log('role =', idToken.payload['cognito:roles'][0]);
    this.curAwsCreds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.isSignedInAsOwner ? environment.ownerIdentityPoolId : environment.frontDeskIdentityPoolId,
      Logins,
      DurationSeconds: 3600,
      // RoleArn: idToken.payload['cognito:roles'][0],
    });
    await this.curAwsCreds.getPromise();
    return this.curAwsCreds;
  }

  /**
   * Documentation:
   *  https://github.com/mhart/aws4fetch
   * @param request
   * @param creds
   * @returns
   */
  async signRequestWithSignatureV4(request: HttpRequest<unknown>, creds: CognitoIdentityCredentials): Promise<HttpRequest<unknown>> {
    console.log('request.urlWithParams =', request.urlWithParams);
    const signer = new AwsV4Signer({
      url: request.urlWithParams,                // required, the AWS endpoint to sign
      accessKeyId: creds.accessKeyId,        // required, akin to AWS_ACCESS_KEY_ID
      secretAccessKey: creds.secretAccessKey,    // required, akin to AWS_SECRET_ACCESS_KEY
      sessionToken: creds.sessionToken,       // akin to AWS_SESSION_TOKEN if using temp credentials
      method: request.method,             // if not supplied, will default to 'POST' if there's a body, otherwise 'GET'
      // headers: request.headers,            // standard JS object literal, or Headers instance
      // body,               // optional, String or ArrayBuffer/ArrayBufferView – ie, remember to stringify your JSON
      // signQuery: true,          // set to true to sign the query string instead of the Authorization header
      service: 'execute-api',            // AWS service, by default parsed at fetch time
      region: 'us-east-1',             // AWS region, by default parsed at fetch time
      // cache,              // credential cache, defaults to `new Map()`
      // datetime: ,           // defaults to now, to override use the form '20150830T123600Z'
      // appendSessionToken, // set to true to add X-Amz-Security-Token after signing, defaults to true for iot
      // allHeaders,         // set to true to force all headers to be signed instead of the defaults
      // singleEncode,       // set to true to only encode %2F once (usually only needed for testing)
    })
    const signed = await signer.sign();
    const jwtToken = this.curUser?.getSignInUserSession()?.getIdToken()?.getJwtToken();
    if (!jwtToken) {
      throw new Error('jwtToken is empty');
    }
    const headers = request.headers
      .append('authorization', signed.headers.get('authorization')!)
      .append('x-amz-date', signed.headers.get('x-amz-date')!)
      .append('x-amz-security-token', signed.headers.get('x-amz-security-token')!)
      .append('jwt-token', jwtToken);
    return request.clone({
      headers: headers,
    });
  }

  /**
   * Custom signature v4 signing function. Deprecated in favor of signRequestWithSignatureV4() using the aws4fetch npm library.
   *
   * Documentation:
   *  https://docs.aws.amazon.com/general/latest/gr/create-signed-request.html
   *
   * @param request
   * @param creds
   * @returns
   */
  private _signRequestWithSignatureV4(request: HttpRequest<unknown>, creds: CognitoIdentityCredentials): HttpRequest<unknown> {
    console.log('creds =', creds);

    // Task 1: Create canonical request
    const service = 'execute-api'
    const host = this.baseUrl.split('//')[1];
    const amzdate = new Date().toISOString().split('.')[0].replace(/[-|:]/g, '') + 'Z';

    const canonical_uri = '/get-coupon-status'; // TODO: extract from request.url
    // const request_parameters = 'Action=DescribeRegions&Version=2013-10-15';
    console.log('params =', request.params.keys);
    console.log('headers =', request.headers.keys);
    const canonical_querystring = 'coupon=SDFSDF&bids=venus'; // TODO: extract from request.params
    const canonical_headers = 'host:' + host + '\n' +
      'x-amz-date:' + amzdate + '\n' +
      'x-amz-security-token:' + creds.sessionToken + '\n'; // TODO: extract from request.headers
    const signed_headers = 'host;x-amz-date;x-amz-security-token'; // TODO: extract from request.headers
    console.log('body =', request.body);
    // const hexEncodedHash = this.hash(request.body ? request.body as string : '');
    const hexEncodedHash = this.hash(''); // TODO: extract from request.body
    // const hexEncodedHash = '';
    console.log('hexEncodedHash =', hexEncodedHash);
    const canical_request = request.method + '\n' +
      canonical_uri + '\n' +
      canonical_querystring + '\n' +
      canonical_headers + '\n' +
      signed_headers + '\n' +
      hexEncodedHash
    console.log('canical_request =', canical_request);

    // Task 2: Create string to sign
    const region = 'us-east-1';
    const algorithm = 'AWS4-HMAC-SHA256';
    const datestamp = amzdate.split('T')[0];
    const credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request'
    const string_to_sign = algorithm + '\n' + amzdate + '\n' + credential_scope + '\n' + this.hash(canical_request);

    // Task 3: calcualte the signature
    const signing_key = this.getSignatureKey(creds.secretAccessKey, datestamp, region, service);
    const signature = this.sign(signing_key, string_to_sign).toString();

    // Task 4: add signature to the request
    const authorization_header = algorithm + ' ' + 'Credential=' + creds.accessKeyId + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;
    console.log('authorization_header =', authorization_header);

    const headers = request.headers
      .append('Authorization', authorization_header)
      .append('X-Amz-Date', amzdate)
      .append('X-Amz-Security-Token', creds.sessionToken);
    // const headers = new HttpHeaders({
    //   'Authorization': 'AWS4-HMAC-SHA256 Credential=ASIAU4CRXPTBD5EWIQL2/20230124/us-east-1/execute-api/aws4_request, SignedHeaders=host;x-amz-date;x-amz-security-token, Signature=0e4df837dc4c95fbecaa55d377eba202381f98f12c36eb03dbca5fff648f4754',
    //   'X-Amz-Date': '20230124T025727Z',
    //   'X-Amz-Security-Token': 'IQoJb3JpZ2luX2VjEHsaCXVzLWVhc3QtMSJIMEYCIQCtpUmWFoDRUDHPo8jY1hEkXO+92ipJguC9rux8V7va1gIhALCXChvdgKCZN5Xe+6U8QQaLbdaz7mNyLbmdWaojsd0XKs0ECOP//////////wEQABoMMzM1MTc4ODU3NjY2Igy8/IKfxDBdt5SF3DUqoQRSUfNO0VAn4oY1iLkvPzl/LOCW9OM5e+WrqDN0byVXLxQzp+43sUWxeEb+grd8ivr7noxZviY95C40+026ie+kwRNolMWWJzWv/aA8pN9er0pzGAtG1WUzCP0a2d6lG57b3WTygv85avauvSIFV9ebjWHEDCsTB8jiIJr9vJq6iF/YDbpcMc1XSbfZEv1A+gcDYL2ibsbU5TzgJe5yg5AAl7NSaU1MLUtNeChMm8SmX9Vl18M3m/ojbFkWslxcBZSwb9QmovLWh3Z9/c9RmZZ13Sc23iK45fDV3Dv+mAoOhtYdj6TyU/sZ3kvMl4pkKRjRHTJy1xGJbN+RxV1kCvrkkFZFqoblqnlLCDPxV8Cr39LiWhva/bFh2vkSxZpTGJ4Jnvx11ysB4a2GLFOz85F5EUO5ifv2tthVJcpAP5BtCIgIXRBF1f54vBPD/7ImRoI0h9cQvCRt36FOSrHZ9kx8bUv4hFcCfq40vyUBO4AFoxroxegttDw6Y4cet/hLkxPllqjOWuIOlYbGpXzMr82X5Nz86j8h2l9T1q5sxzSboKRAWjaCsRVsbW/aCnCXuHGQgBEQBU6C4IPGCskDgBJY8kI6u7VqhWQCKwSp0kw1s+EYDO0a1ggulNoT8nkFZTM2D64qiTILvvCfBDXoPqZwayFVxfFDbV+l15T7FIDekLUx3tqg41ya0HoTSdCXWpPV7igBVXztgm6vtkDVhN4X0jCy/ryeBjqEAu6raopAYyv8PG7QNtu/0yJ7MWWGBgj3ZKkrPDfoYQ0ccErXBgvHMd7TBDwvrN/hNBm2XIWr7V7gy9jKA+qpksJ3vM2RX98BPLS7X6qes1VPCFxL41jjFIiPU4T8VfBagqaEiu9ldqajv1qkqs7FLJTGgcXeZkIVj9um+naVwm6MGrQuYk4kR3/TsG43s8mSMYsnuagcvxzf+3VAnGqFoeaBm9bhtnVT3pqa2JTuSMWg3+zGfBmU5Is84Gi7qF/75RwMqTSfwKiC5mst3id2Rhxw8TKtrpUvrnwU/HBsM9dSXe6EzbfnBQUYccXllEMobWUkk1nuvYRtz+4qjqY1pZyauJFi'
    // });
    return request.clone({
      headers: headers,
      // params: request.params.appendAll({
      //   bid: 'venus', // TODO: remove hard-coded
      // })
    });
  }

  // private decoder = new TextDecoder();
  private sign(key: CryptoJS.lib.WordArray, msg: string): CryptoJS.lib.WordArray {
    return HmacSHA256(msg, key);
  }

  private getSignatureKey(key: string, date_stamp: string, regionName: string, serviceName: string) {
    const kDate = this.sign(enc.Utf8.parse('AWS4' + key), date_stamp);
    const kRegion = this.sign(kDate, regionName);
    const kService = this.sign(kRegion, serviceName);
    const kSigning = this.sign(kService, 'aws4_request');
    return kSigning;
  }

  private hash(msg: string) {
    return SHA256(msg).toString(enc.Hex);
  }
}
