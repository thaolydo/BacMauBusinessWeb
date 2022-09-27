import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { CouponComponent } from './pages/coupon/coupon.component';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SmsComponent } from './pages/sms/sms.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/customer-check-in?bid=venus' },
  { path: 'customer-check-in', component: CustomerCheckInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'sms', component: SmsComponent, canActivate: [AuthGuard] },
  { path: 'coupon', component: CouponComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
