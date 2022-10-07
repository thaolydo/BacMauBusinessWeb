import { Pipe, PipeTransform } from '@angular/core';
import { CognitoUser } from 'amazon-cognito-identity-js';

@Pipe({
  name: 'username'
})
export class UsernamePipe implements PipeTransform {

  transform(user: CognitoUser | undefined, ...args: unknown[]): unknown {
    console.log('user =', user);
    if (!user) {
      return undefined;
    }
    return user.getUsername();
  }

}
