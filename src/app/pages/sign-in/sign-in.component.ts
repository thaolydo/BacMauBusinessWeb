import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  form: FormGroup;
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this._fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  get username() {
    return this.form.get('username')?.value as string;
  }

  get password() {
    return this.form.get('password')?.value as string;
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const res = await this.authService.signIn(this.username, this.password);
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
