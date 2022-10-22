import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from '@model/role.model';
import { AuthGuard } from './auth.guard';
import { CouponComponent } from './pages/coupon/coupon.component';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SmsComponent } from './pages/sms/sms.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/customer-check-in' },
  { path: 'customer-check-in', component: CustomerCheckInComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK] } },
  { path: 'sign-in', component: SignInComponent },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
  { path: 'sms', component: SmsComponent, canActivate: [AuthGuard], data: { roles: [Role.OWNER] } },
  { path: 'coupon', component: CouponComponent, canActivate: [AuthGuard], data: { roles: [Role.FRONT_DESK, Role.OWNER] } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
