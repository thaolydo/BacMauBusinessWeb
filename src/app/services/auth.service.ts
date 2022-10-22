import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthEventType } from 'src/app/models/auth-event-types.enum';
import { Role } from '@model/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private ownerUserPool: CognitoUserPool;
  // private frontDeskUserPool: CognitoUserPool;

  private eventSubject: Subject<AuthEventType> = new Subject();

  constructor() {
    this.ownerUserPool = new CognitoUserPool({
      ClientId: environment.ownerUserPoolClientId,
      UserPoolId: environment.ownerUserPoolId
    });
    // this.frontDeskUserPool = new CognitoUserPool({
    //   ClientId: environment.frontDeskUserPoolClientId,
    //   UserPoolId: environment.frontDeskUserPoolId
    // });
  }

  signIn(username: string, password: string): Promise<CognitoUser> {
    console.log(`Signing in user with username '${username}'`);
    const user = new CognitoUser({
      Pool: this.ownerUserPool,
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
      return user.getUsername() == 'venus-admin'; // TODO: change this when creating new user in the pool
    }
    if (role == Role.FRONT_DESK) {
      return user.getUsername() == 'frontdesk'; // TODO: change this when creating new user in the pool
    }
    return false;
  }

  getAuthEventUpdates() {
    return this.eventSubject.asObservable();
  }
}
