import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
  ) {
    this.form = this._fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      // asOwner: true
    });
  }

  async ngOnInit() {
    const curUser = await this.authService.getCurUser();
    if (curUser) {
      console.log('Already signed in. Navigating to page /customers');
      this.router.navigate(['/customers']);
    }
  }

  get username() {
    return this.form.get('username')?.value as string;
  }

  get password() {
    return this.form.get('password')?.value as string;
  }

  // Deprecated
  // get asOwner() {
  //   return this.form.get('asOwner')?.value as boolean;
  // }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const res = await this.authService.signIn(this.username.toLowerCase(), this.password);
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
