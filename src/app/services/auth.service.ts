import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoRefreshToken, CognitoUser, CognitoUserPool, CognitoUserSession, ICognitoUserAttributeData, UserData } from 'amazon-cognito-identity-js';
import { Subject, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthEventType } from 'src/app/models/auth-event-types.enum';
import { Role, UserGroup } from '@model/role.model';
import * as AWS from "aws-sdk/global";
import { LoginsMap } from "aws-sdk/clients/cognitoidentity";
// import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { SHA256, enc, HmacSHA256 } from 'crypto-js';
import { CognitoIdentityCredentials } from 'aws-sdk/global';
import { HttpRequest } from '@angular/common/http';
import { AwsV4Signer } from 'aws4fetch';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordComponent } from '../pages/reset-password/reset-password.component';
import { Location } from '@angular/common';

// Documentation: https://www.npmjs.com/package/amazon-cognito-identity-js
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.baseUrl;
  private userPool: CognitoUserPool;

  private eventSubject: Subject<AuthEventType> = new Subject();
  private curUser: CognitoUser | null = null;
  private curAwsCreds: CognitoIdentityCredentials | undefined;

  private refreshToken: CognitoRefreshToken | undefined = undefined;

  constructor(
    private router: Router,
    private dialog: MatDialog,
  ) {
    this.userPool = new CognitoUserPool({
      ClientId: environment.userPoolClientId,
      UserPoolId: environment.userPoolId,
    });

    if (this.userPool.getCurrentUser() != null) {
      this.curUser = this.userPool.getCurrentUser();
    }
  }

  signIn(username: string, password: string): Promise<CognitoUser> {
    console.log(`Signing in user with username '${username}'`);
    const user = new CognitoUser({
      Pool: this.userPool,
      Username: username,
    });
    return new Promise((resolve, reject) => {
      user.authenticateUser(new AuthenticationDetails({
        Username: username,
        Password: password,
      }), {
        onSuccess: (session: CognitoUserSession) => {
          console.log(`Successfull signed in with username '${username}' and session`, session);
          this.curUser = user;
          this.eventSubject.next(AuthEventType.SIGNED_IN);
          resolve(user);
        },
        newPasswordRequired: async (userAttributes, requiredAttributes) => {
          // https://stackoverflow.com/questions/40287012/how-to-change-user-status-force-change-password

          // User was signed up by an admin and must provide new
          // password and required attributes, if any, to complete
          // authentication.

          // Deprecated, will use hosted UI to handle this
          // // the api doesn't accept this field back
          // console.log('userAttributes =', JSON.stringify(userAttributes));
          // delete userAttributes.email_verified;
          // // delete userAttributes.email;

          // // Get these details and call
          // const newPassword = prompt('New Password')!;
          // user.completeNewPasswordChallenge(newPassword, userAttributes, this);

          // this.openHostedUiSignInPage('New Password Required: You must change your password to continue. Redirecting to creating new password page.');
          alert('New Password Required');
          const dialogRef = this.dialog.open(ResetPasswordComponent);
          const newPassword = await firstValueFrom(dialogRef.afterClosed());
          console.log('newPassword =', newPassword);
          if (newPassword) {
            // the api doesn't accept this field back
            delete userAttributes.email_verified;
            user.completeNewPasswordChallenge(newPassword, {}, {
              onSuccess: async () => {
                console.log('success');
                this.curUser = user;
                this.eventSubject.next(AuthEventType.SIGNED_IN);
                resolve(user);
              },
              onFailure: (err) => {
                alert(`Failed to reset password`);
                console.error(`Failed to reset password with error:`, err);
                reject(err);
              }
            });
          }
        },
        onFailure: (err) => {
          // Possible err.code:
          // UserNotFoundException: username not signed up yet
          // NotAuthorizedException: wrong username/password
          // UserNotConfirmedException: account is not verified yet by owner
          // UsernameExistsException: username exists

          if (err.code === 'PasswordResetRequiredException') {
            this.openHostedUiForgotPasswordPage('Password Reset Required: You must change your password to continue. Redirecting to password reset page.');
            resolve(user);
            return;
          }
          console.error(`Failed to login with error:`, err);
          reject(err);
        }
      });
    });
  }

  buildHostedUiForgotPasswordPage() {
    return `https://${environment.cognitoDomain}.auth.us-east-1.amazoncognito.com/forgotPassword?client_id=${environment.userPoolClientId}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=${encodeURIComponent(environment.callBackUrl)}`;
  }

  openHostedUiForgotPasswordPage(alertMessage?: string) {
    if (alertMessage) {
      alert(alertMessage);
    }
    const url = new URL(this.buildHostedUiForgotPasswordPage());
    url.searchParams.append('redirect_uri', environment.callBackUrl);
    console.log('redirecting to url:', url.toString());
    window.open(
      url.toString(),
      '_blank',
    );
  }

  openHostedUiSignInPage(alertMessage?: string) {
    if (alertMessage) {
      alert(alertMessage);
    }
    const url = new URL(`https://${environment.cognitoDomain}.auth.us-east-1.amazoncognito.com/oauth2/authorize?client_id=${environment.userPoolClientId}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile`);
    url.searchParams.append('redirect_uri', environment.callBackUrl);
    console.log('redirecting to url:', url.toString());
    window.open(
      url.toString(),
      '_blank',
    );
  }

  // // deprecated
  // signInAsOwner(username: string, password: string): Promise<CognitoUser> {
  //   return this._signIn(username, password, true);
  // }

  // // deprecated
  // signInAsFrontdesk(username: string, password: string): Promise<CognitoUser> {
  //   return this._signIn(username, password, false);
  // }

  // // deprecated
  // _signIn(username: string, password: string, asOwner: boolean): Promise<CognitoUser> {
  //   console.log(`Signing in user with username '${username}'`);
  //   const user = new CognitoUser({
  //     Pool: asOwner ? this.userPool : this.frontDeskUserPool,
  //     Username: username,
  //   });
  //   return new Promise((resolve, reject) => {
  //     user.confirmPassword
  //     user.authenticateUser(new AuthenticationDetails({
  //       Username: username,
  //       Password: password,
  //     }), {
  //       onSuccess: (session) => {
  //         console.log(`Successfull signed in with username '${username}' and session '${JSON.stringify(session)}'`);
  //         this.isSignedInAsOwner = asOwner;
  //         this.curUser = user;
  //         this.eventSubject.next(AuthEventType.SIGNED_IN);
  //         resolve(user);
  //       },
  //       newPasswordRequired: function (userAttributes, requiredAttributes) {
  //         // https://stackoverflow.com/questions/40287012/how-to-change-user-status-force-change-password

  //         // User was signed up by an admin and must provide new
  //         // password and required attributes, if any, to complete
  //         // authentication.

  //         // the api doesn't accept this field back
  //         delete userAttributes.email_verified;

  //         // unsure about this field, but I don't send this back
  //         delete userAttributes.phone_number_verified;

  //         // Get these details and call
  //         user.completeNewPasswordChallenge(password, userAttributes, this);
  //       },
  //       onFailure: (err) => {
  //         /* Possible err.code:
  //           UserNotFoundException: username not signed up yet
  //           NotAuthorizedException: wrong username/password
  //           UserNotConfirmedException: account is not verified yet by owner
  //           UsernameExistsException: username exists
  //         */
  //         console.error(err);
  //         reject(err);
  //       }
  //     });
  //   });
  // }

  // https://stackoverflow.com/questions/38110615/how-to-allow-my-user-to-reset-their-password-on-cognito-user-pools
  async forgotPassword(): Promise<void> {
    console.log('forgotPassword');
    const curUser = await this.getCurUser();
    if (!curUser) {
      throw new Error('confirmPassword(): User is not signed in');
    }

    return new Promise((resolve, reject) => {
      curUser.forgotPassword({
        onSuccess: (data) => {
          resolve();
        },
        onFailure: (err: Error) => {
          reject(err);
        }
      });
    });
  }

  async confirmPassword(newPassword: string, verificationCode: string): Promise<string> {
    console.log(`Resetting password`);
    const curUser = await this.getCurUser();
    if (!curUser) {
      throw new Error('confirmPassword(): User is not signed in');
    }
    return new Promise((resolve, reject) => {
      curUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: (success: string) => {
          console.log('Successfully reset password');
          resolve(success);
        },
        onFailure: (err: Error) => {
          reject(err);
        }
      })
    });
  }

  signOut(): Promise<string> {
    console.log('signing out');
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
        this.refreshToken = session.getRefreshToken();
        resolve(this.curUser);
      });
    });
  }

  async refreshUser() {
    return new Promise((resolve, reject) => {
      this.curUser?.refreshSession(this.refreshToken!, (err: any, session: CognitoUserSession) => {
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
        this.refreshToken = session.getRefreshToken();
        resolve(this.curUser);
      });
    });
  }

  async getCurUserRole(ignoreError: boolean = false): Promise<Role> {
    const groups = this.curUser?.getSignInUserSession()?.getIdToken().payload['cognito:groups'] as UserGroup[];
    if (!groups || groups.length == 0) {
      if (!ignoreError) {
        console.trace();
        // TODO: notify admin
        alert('Your account does not belong to a group. Please contact admin to fix it.');
        await this.signOut();
        await this.router.navigate(['/sign-in']);
      }
      return Role.OTHER;
    }
    const group = groups[0];
    if (group === UserGroup.FRONT_DESK_GROUP) {
      return Role.FRONT_DESK;
    } else if (group === UserGroup.OWNER_GROUP) {
      return Role.OWNER;
    } else if (group === UserGroup.CHECK_IN_GROUP) {
      return Role.CHECK_IN;
    } else {
      if (!ignoreError) {
        // TODO: notify admin
        alert('Invalid user role. Please contact admin');
      }
      return Role.OTHER;
    }
  }

  async getUserData(): Promise<UserData> {
    const curUser = await this.getCurUser();
    return new Promise((resolve, reject) => {
      curUser?.getUserData((err, userData) => {
        resolve(userData as UserData);
      });
    });
  }

  async getDefaultBid(): Promise<string> {
    const userData = await this.getUserData();
    return userData.UserAttributes.find(attribute => attribute.Name === 'custom:bid')!.Value;
  }

  async getDefaultBusinessName(): Promise<string> {
    const userData = await this.getUserData();
    return userData.UserAttributes.find(attribute => attribute.Name === 'custom:businessName')!.Value;
  }

  async getUserEmail(): Promise<string> {
    const userData = await this.getUserData();
    return userData.UserAttributes.find(attribute => attribute.Name === 'email')!.Value;
  }

  async emailVerified(): Promise<boolean> {
    const userData = await this.getUserData();
    console.log('userData =', userData);
    return userData.UserAttributes.find(attribute => attribute.Name === 'email_verified')?.Value === 'true';
  }

  async getSmsCost(): Promise<number> {
    const userData = await this.getUserData();
    return parseFloat(userData.UserAttributes.find(attribute => attribute.Name === 'custom:smsCost')!.Value);
  }

  // // Deprecated
  // async hasRole(role: Role) {
  //   const curUserGroup = this.getCurUserGroup();
  //   if (!curUserGroup) {
  //     return false;
  //   }
  //   if (role == Role.OWNER) {
  //     return environment.userPoolId === userPoolId;
  //   }
  //   if (role == Role.FRONT_DESK) {
  //     return environment.frontDeskUserPoolId === userPoolId;
  //   }
  //   return false;
  // }

  getAuthEventUpdates() {
    return this.eventSubject.asObservable();
  }

  // https://github.com/amazon-archives/aws-cognito-angular-quickstart/blob/master/src/app/service/cognito.service.ts#L79
  async getAwsCredentials(): Promise<AWS.CognitoIdentityCredentials | undefined> {
    if (!this.curUser) {
      throw new Error('user not logged in');
    }

    // TODO: cache aws creds to local storage instead of this.curAwsCreds
    await this.getCurUser();
    if (this.curAwsCreds && this.curUser?.getSignInUserSession()?.getIdToken()) {
      const curJwtToken = this.curUser?.getSignInUserSession()?.getIdToken().getJwtToken();
      if (!await this.getCurUser()) {
        alert('User session has expired');
        this.router.navigate(['/sign-in']);
        return undefined;
      }
      const newJwtToken = this.curUser?.getSignInUserSession()?.getIdToken().getJwtToken();
      if (curJwtToken === newJwtToken) {
        console.log('same jwt');

        // Using cached creds
        if (this.curAwsCreds.needsRefresh()) {
          console.log('refreshing aws creds');
          try {
            await this.curAwsCreds.refreshPromise();
            // throw new Error();
          } catch(e: any) {
            alert(`refreshPromise: ${e.message}. Please login again`);
            await this.signOut();
            await this.router.navigate(['/sign-in']);
            return undefined;
          }
        }

        return this.curAwsCreds!;
      }
    }

    // Building new aws creds
    // if (!this.curUser?.getSignInUserSession()?.getIdToken()?.getJwtToken()) {
    //   console.log('cur user does not have active session');
    //   await this.getCurUser();
    // }
    await this.getCurUser(); // always refresh the session to get latest jwt token

    console.log('getAwsCredentials: user =', this.curUser);

    AWS.config.region = 'us-east-1';
    // TODO: fix hardcoding user pool ID
    const url = `cognito-idp.us-east-1.amazonaws.com/${environment.userPoolId}`;
    const Logins = {} as LoginsMap;
    const idToken = this.curUser.getSignInUserSession()!.getIdToken();
    Logins[url] = idToken.getJwtToken();
    // console.log('role =', idToken.payload['cognito:roles'][0]);
    this.curAwsCreds = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: environment.identityPoolId,
      Logins,
      DurationSeconds: 3600,
      // RoleArn: idToken.payload['cognito:roles'][0],
    }, {});
    try {
      // throw new Error();
      await this.curAwsCreds.getPromise();
    } catch (err) {
      console.log('Logins =', JSON.stringify(Logins));
      console.error(err);
      // TODO: debug this
      location.reload();
    }
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
    console.log('signRequestWithSignatureV4');
    console.log('creds =', creds); // TODO: remove in prod
    const signer = new AwsV4Signer({
      url: request.urlWithParams,                // required, the AWS endpoint to sign
      accessKeyId: creds.accessKeyId,        // required, akin to AWS_ACCESS_KEY_ID
      secretAccessKey: creds.secretAccessKey,    // required, akin to AWS_SECRET_ACCESS_KEY
      sessionToken: creds.sessionToken,       // akin to AWS_SESSION_TOKEN if using temp credentials
      method: request.method,             // if not supplied, will default to 'POST' if there's a body, otherwise 'GET'
      // headers: request.headers,            // standard JS object literal, or Headers instance
      body: request.body ? JSON.stringify(request.body) : '',               // optional, String or ArrayBuffer/ArrayBufferView – ie, remember to stringify your JSON
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
    // console.log('signed =', signed.headers.forEach((val, key, parent) => {
    //   console.log('elem:', key, val);
    // }));
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
  async _signRequestWithSignatureV4(request: HttpRequest<unknown>, creds: CognitoIdentityCredentials): Promise<HttpRequest<unknown>> {
    console.log('creds =', creds);

    // Task 1: Create canonical request
    const service = 'execute-api'
    const host = this.baseUrl.split('//')[1];
    const amzdate = new Date().toISOString().split('.')[0].replace(/[-|:]/g, '') + 'Z';

    const canonical_uri = '/send-sms-to-customers'; // TODO: extract from request.url
    // const request_parameters = 'Action=DescribeRegions&Version=2013-10-15';
    console.log('params =', request.params.toString());
    console.log('headers =', request.headers.keys);
    const canonical_querystring = request.params.toString();
    const canonical_headers = 'host:' + host + '\n' +
      'x-amz-date:' + amzdate + '\n' +
      'x-amz-security-token:' + creds.sessionToken + '\n'; // TODO: extract from request.headers
    const signed_headers = 'host;x-amz-date;x-amz-security-token'; // TODO: extract from request.headers
    console.log('body =', request.body);
    const hexEncodedHash = this._hash(request.body ? JSON.stringify(request.body) : '');
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
    const string_to_sign = algorithm + '\n' + amzdate + '\n' + credential_scope + '\n' + this._hash(canical_request);

    // Task 3: calcualte the signature
    const signing_key = this.getSignatureKey(creds.secretAccessKey, datestamp, region, service);
    const signature = this._sign(signing_key, string_to_sign).toString();

    // Task 4: add signature to the request
    const authorization_header = algorithm + ' ' + 'Credential=' + creds.accessKeyId + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature;
    console.log('authorization_header =', authorization_header);

    const jwtToken = this.curUser?.getSignInUserSession()?.getIdToken()?.getJwtToken();
    if (!jwtToken) {
      throw new Error('jwtToken is empty');
    }
    const headers = request.headers
      .append('Authorization', authorization_header)
      .append('x-amz-content-sha256', hexEncodedHash)
      .append('X-Amz-Date', amzdate)
      .append('X-Amz-Security-Token', creds.sessionToken)
      .append('jwt-token', jwtToken);
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
  private _sign(key: CryptoJS.lib.WordArray, msg: string): CryptoJS.lib.WordArray {
    return HmacSHA256(msg, key);
  }

  private getSignatureKey(key: string, date_stamp: string, regionName: string, serviceName: string) {
    const kDate = this._sign(enc.Utf8.parse('AWS4' + key), date_stamp);
    const kRegion = this._sign(kDate, regionName);
    const kService = this._sign(kRegion, serviceName);
    const kSigning = this._sign(kService, 'aws4_request');
    return kSigning;
  }

  private _hash(msg: string) {
    return SHA256(msg).toString(enc.Hex);
  }

  async updateAttributes(attributes: ICognitoUserAttributeData[]) {
    const curUser = await this.getCurUser();
    return new Promise((resolve, reject) => {
      curUser?.updateAttributes(attributes, (err, res) => {
        if (err) {
          // TODO: notify admin
          alert(`updateAttributes: ${err.message || JSON.stringify(err)}`);
          reject(err.message);
        }
        console.log('updated user attributes:', res);
        resolve(res);
        this.eventSubject.next(AuthEventType.ATTRIBUTE_UPDATED);
      });

    });
  }

  async verifyEmail(verificationCode: string): Promise<string | Error> {
    const curUser = await this.getCurUser();
    return new Promise((resolve, reject) => {
      curUser?.verifyAttribute('email', verificationCode, {
        onFailure(err: Error) {
          // alert(err.message || JSON.stringify(err));
          console.log('err type:', typeof err);
          console.log('err name:', err.name);
          console.log('err message:', err.message);
          reject(err);
        },
        onSuccess(success) {
          resolve(success);
        },
      });

    });
  }
}
