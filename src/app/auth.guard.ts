import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Role } from '@model/role.model';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    // Check AuthN
    const curUser = await this.authService.getCurUser();
    if (!curUser) {
      this.router.navigate(['/sign-in']);
      return false;
    }

    // Check for required attributes
    const jwtPayload = curUser.getSignInUserSession()?.getIdToken().payload as any;
    const bid = jwtPayload['custom:bid'];
    const businessName = jwtPayload['custom:businessName'];
    if (!bid || !businessName) {
      alert('Business Name is not set. Please contact admin to add Business Name.');
      await this.authService.signOut();
      this.router.navigate(['/sign-in']);
      return false;
    }

    // Check AuthZ
    const roles = route?.data['roles'] as Role[];
    if (roles) {
      let hasRole = false;
      const curRole = this.authService.getCurUserRole();
      for (const role of roles) {
        if (role === curRole) {
          hasRole = true;
          break;
        }
      }

      if (!hasRole) {
        alert('You are not authorized to view this page');
        return false;
      }
    }

    return true;
  }

}
