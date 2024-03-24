import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from '@model/role.model';
import { AuthGuard } from './auth.guard';
import { CouponComponent } from './pages/coupon/coupon.component';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SmsComponent } from './pages/sms/sms.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent },
  { path: 'customer-check-in', component: CustomerCheckInComponent, canActivate: [], data: { roles: [Role.FRONT_DESK] } },
  // { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
  { path: 'sms', component: SmsComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
  { path: 'coupon', component: CouponComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
