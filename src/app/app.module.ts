import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerCheckInComponent } from './pages/customer-check-in/customer-check-in.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialModule } from './material/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { UsernamePipe } from './username.pipe';
import { CustomersComponent } from './pages/customers/customers.component';
import { SendSmsComponent } from './components/send-sms/send-sms.component';
import { SubscribeDialogComponent } from './components/subscribe-dialog/subscribe-dialog.component';
import { SubmitButtonComponent } from './components/submit-button/submit-button.component';
import { CheckInHistoryComponent } from './components/check-in-history/check-in-history.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { SmsHistoryComponent } from './components/sms-history/sms-history.component';
import { SmsComponent } from './pages/sms/sms.component';
import { PhonePipe } from './pipes/phone.pipe';
import { CouponComponent } from './pages/coupon/coupon.component';
import { CheckInSuccessDialogComponent } from './components/check-in-success-dialog/check-in-success-dialog.component';
import { AwsSigningInterceptor } from '@service/aws-signing.interceptor';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { HomeComponent } from './pages/home/home.component';
import { AttachBidInterceptor } from '@service/attach-bid.interceptor';
import { SettingsComponent } from './pages/settings/settings.component';
import { EmailVerificationDialogComponent } from './components/email-verification-dialog/email-verification-dialog.component';
import { TermsOfUseDialogComponent } from './pages/terms-of-use-dialog/terms-of-use-dialog.component';
import { PrivacyPolicyDialogComponent } from './pages/privacy-policy-dialog/privacy-policy-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerCheckInComponent,
    SignInComponent,
    NavBarComponent,
    UsernamePipe,
    CustomersComponent,
    SmsComponent,
    SubscribeDialogComponent,
    TermsOfUseDialogComponent,
    PrivacyPolicyDialogComponent,
    SubmitButtonComponent,
    CheckInHistoryComponent,
    CustomerListComponent,
    SmsHistoryComponent,
    SendSmsComponent,
    PhonePipe,
    CouponComponent,
    CheckInSuccessDialogComponent,
    ResetPasswordComponent,
    HomeComponent,
    SettingsComponent,
    EmailVerificationDialogComponent,
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
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AttachBidInterceptor, multi: true, },
    { provide: HTTP_INTERCEPTORS, useClass: AwsSigningInterceptor, multi: true, }, // this must be at the end so that the request is finalized before signing; otherwise the signature won't match, and we get 403 error
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
