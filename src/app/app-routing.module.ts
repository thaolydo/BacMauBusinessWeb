import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/customer-check-in?bid=venus' },
  { path: 'customer-check-in', component: CustomerCheckInComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
