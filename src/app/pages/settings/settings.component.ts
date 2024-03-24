import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@service/auth.service';
import { ICognitoUserAttributeData } from 'amazon-cognito-identity-js';
import { EmailVerificationDialogComponent } from 'src/app/components/email-verification-dialog/email-verification-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  form: FormGroup;
  isLoading: boolean = true;
  isSubmitting = false;
  initialEmail: string = '';
  resetPasswordLink = `https://pham-sms.auth.us-east-1.amazoncognito.com/forgotPassword?client_id=${environment.userPoolClientId}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=${encodeURIComponent(environment.callBackUrl)}`;
  emailVerified: boolean = false;

  constructor(
    private _fb: FormBuilder,
    protected authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.form = this._fb.group({
      businessName: ['', Validators.required],
      email: ['', Validators.required],
    });
    this.form.disable();
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const businessName = await this.authService.getDefaultBusinessName();
      const email = await this.authService.getUserEmail();
      this.emailVerified = await this.authService.emailVerified();
      this.initialEmail = email;
      console.log
      this.form.setValue({
        businessName,
        email,
      })
    } finally {
      this.isLoading = false;
      this.form.enable();
    }
  }

  onVerify() {
    this.dialog.open(EmailVerificationDialogComponent, {
      height: '12em',
      width: '20em'
    });
  }

  async onSubmit() {
    this.isSubmitting = true;
    this.form.disable();
    try {
      const attributes: ICognitoUserAttributeData[] = [
        {
          Name: 'custom:businessName',
          Value: this.form.get('businessName')?.value,
        },
        {
          Name: 'email',
          Value: this.form.get('email')?.value,
        },
      ];
      await this.authService.updateAttributes(attributes);
      await this.ngOnInit();
    } finally {
      this.isSubmitting = false;
      this.form.markAsPristine();
      this.form.enable();
    }
  }

}
