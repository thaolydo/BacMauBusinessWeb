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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.baseUrl;
  private ownerUserPool: CognitoUserPool;
  private frontDeskUserPool: CognitoUserPool;

  private eventSubject: Subject<AuthEventType> = new Subject();

  constructor() {
    this.ownerUserPool = new CognitoUserPool({
      ClientId: environment.ownerUserPoolClientId,
      UserPoolId: environment.ownerUserPoolId,
    });
    this.frontDeskUserPool = new CognitoUserPool({
      ClientId: environment.frontDeskUserPoolClientId,
      UserPoolId: environment.frontDeskUserPoolId
    });
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
        this.eventSubject.next(AuthEventType.SIGNED_OUT);
        resolve('success');
      });
    });
  }

  // async getCurUser(): Promise<CognitoUser | undefined> {
  //   const curUser = await this._getCurUser(true);
  //   return curUser ? curUser : await this._getCurUser(false);
  // }

  getCurUser(): Promise<CognitoUser | undefined> {
    const curUser = this.ownerUserPool.getCurrentUser();
    return new Promise((resolve, reject) => {
      if (!curUser) {
        console.log('getCurUser(): User not logged in');
        resolve(undefined);
        return;
      }
      curUser.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          console.log('getSession() error');
          resolve(undefined);
          return;
        }
        if (!session.isValid()) {
          console.log('Invalid session');
          resolve(undefined);
          return;
        }
        resolve(curUser);
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
    const user = await this.getCurUser();
    if (!user || !user?.getSignInUserSession()?.getIdToken()?.getJwtToken()) {
      throw new Error('user not logged in');
    }
    AWS.config.region = 'us-east-1';
    const url = `cognito-idp.us-east-1.amazonaws.com/${environment.ownerUserPoolId}`;
    const Logins = {} as LoginsMap;
    const idToken = user.getSignInUserSession()!.getIdToken();
    Logins[url] = idToken.getJwtToken();
    // console.log('role =', idToken.payload['cognito:roles'][0]);
    const creds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: environment.ownerIdentityPoolId,
      Logins,
      DurationSeconds: 3600,
      // RoleArn: idToken.payload['cognito:roles'][0],
      // RoleArn: 'arn:aws:iam::335178857666:role/PhamSmsServiceStack-owneridentitypoolAuthenticated-1MCS6BNJBZER5',
    });
    return new Promise((resolve, reject) => {
      creds?.get((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(creds);
      });
    });
  }

  signRequestWithSignatureV4(request: HttpRequest<unknown>, creds: CognitoIdentityCredentials): HttpRequest<unknown> {
    // Task 1: Create canonical request
    const service = 'execute-api'
    const host = this.baseUrl.split('//')[1];
    const amzdate = new Date().toISOString().split('.')[0].replace(/[-|:]/g, '') + 'Z';

    const method = 'GET';
    const canonical_uri = '/';
    // const request_parameters = 'Action=DescribeRegions&Version=2013-10-15';
    const request_parameters = '';
    const canonical_querystring = request_parameters;
    const canonical_headers = 'host:' + host + '\n' + 'x-amz-date:' + amzdate + '\n';
    const signed_headers = 'host;x-amz-date';
    const hexEncodedHash = this.hash('');
    const canical_request = method + '\n' +
      canonical_uri + '\n' +
      canonical_querystring + '\n' +
      canonical_headers + '\n' +
      signed_headers + '\n' +
      hexEncodedHash

    // Task 2: Create string to sign
    const region = 'us-east-1';
    const algorithm = 'AWS4-HMAC-SHA256';
    const datestamp = '20230121';
    const credential_scope = datestamp + '/' + region + '/' + service + '/' + 'aws4_request'
    const string_to_sign = algorithm + '\n' +  amzdate + '\n' +  credential_scope + '\n' +  this.hash(canical_request);

    // Task 3: calcualte the signature
    const signing_key = this.getSignatureKey(creds.secretAccessKey, datestamp, region, service);
    const signature = this.sign(signing_key, string_to_sign).toString();

    // Task 4: add signature to the request
    const authorization_header = algorithm + ' ' + 'Credential=' + creds.accessKeyId + '/' + credential_scope + ', ' +  'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;

    const headers = request.headers
          .append('x-amz-date', amzdate)
          .append('Authorization', authorization_header)
          .append('X-Amz-Security-Token', creds.sessionToken);
    return request.clone({
      headers: headers,
      params: request.params.appendAll({
        bid: 'venus', // TODO: remove hard-coded
      })
    });;
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
