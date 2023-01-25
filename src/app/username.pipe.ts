import { Pipe, PipeTransform } from '@angular/core';
import { CognitoUser } from 'amazon-cognito-identity-js';

@Pipe({
  name: 'username'
})
export class UsernamePipe implements PipeTransform {

  transform(user: CognitoUser | null, ...args: unknown[]): unknown {
    if (!user) {
      return undefined;
    }
    return user.getUsername();
  }

}
