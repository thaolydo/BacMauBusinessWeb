import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this._fb.group({
      username: ['', Validators.required],
      newPassword: ['', Validators.required],
      verificationCode: ['', Validators.required],
      asOwner: true
    });
  }

  async ngOnInit() {
    if (await this.authService.getCurUser()) {
      this.router.navigate(['/customers']);
    }
  }

  get username() {
    return this.form.get('username')?.value as string;
  }

  get newPassword() {
    return this.form.get('newPassword')?.value as string;
  }

  get verificationCode() {
    return this.form.get('verificationCode')?.value as string;
  }

  get asOwner() {
    return this.form.get('asOwner')?.value as boolean;
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const res = this.authService.confirmPassword(this.username.toLowerCase(), this.newPassword, this.verificationCode, this.asOwner);
      console.log('res =', res);
      this.router.navigate(['/customers']);
    } catch (e: any) {
      if (e.name == 'NotAuthorizedException') {
        alert('Incorrect username or password');
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
