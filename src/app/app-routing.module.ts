import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { SendSmsComponent } from './pages/send-sms/send-sms.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/customer-check-in?bid=venus' },
  { path: 'customer-check-in', component: CustomerCheckInComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'send-sms', component: SendSmsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
