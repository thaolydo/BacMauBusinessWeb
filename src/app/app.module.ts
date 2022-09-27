import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from './material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { UsernamePipe } from './username.pipe';
import { CustomersComponent } from './pages/customers/customers.component';
import { SendSmsComponent } from './components/send-sms/send-sms.component';
import { TermsAndConditionsDialogComponent } from './components/terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { CheckInHistoryComponent } from './components/check-in-history/check-in-history.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { SmsHistoryComponent } from './components/sms-history/sms-history.component';
import { SmsComponent } from './pages/sms/sms.component';
import { PhonePipe } from './pipes/phone.pipe';
import { CouponComponent } from './pages/coupon/coupon.component';
import { SubmitFabButtonComponent } from './components/submit-fab-button/submit-fab-button.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerCheckInComponent,
    SignInComponent,
    NavBarComponent,
    UsernamePipe,
    CustomersComponent,
    SmsComponent,
    TermsAndConditionsDialogComponent,
    SubmitButtonComponent,
    SubmitFabButtonComponent,
    CheckInHistoryComponent,
    CustomerListComponent,
    SmsHistoryComponent,
    SendSmsComponent,
    PhonePipe,
    CouponComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMaskModule.forRoot(),
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
