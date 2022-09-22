import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthEventType } from '../model/auth-event-types.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userPool: CognitoUserPool;

  private eventSubject: Subject<AuthEventType> = new Subject();

  constructor() {
    this.userPool = new CognitoUserPool({
      ClientId: environment.userPoolClientId,
      UserPoolId: environment.userPoolId
    });
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
        onSuccess: (session) => {
          console.log(`Successfull signed in with username '${username}' and session '${session}'`);
          this.eventSubject.next(AuthEventType.SIGNED_IN);
          resolve(user);
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

  getCurUser(): Promise<CognitoUser | undefined> {
    const curUser = this.userPool.getCurrentUser();
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

  getAuthEventUpdates() {
    return this.eventSubject.asObservable();
  }
}
