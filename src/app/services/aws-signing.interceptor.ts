import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, retry, switchMap, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AwsSigningInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const interceptHeader = request.headers.get('X-Intercept');
    if (interceptHeader === 'false') {
      console.log('Skipping AttachBidInterceptor');
      return next.handle(request);
    }
    const res = from(this.authService.getAwsCredentials()).pipe(
      retry(3),
      mergeMap(
        creds => this.authService.signRequestWithSignatureV4(request, creds!)
      ),
      switchMap(signedRequest => {
        // console.log('signedRequest =', signedRequest);
        return next.handle(signedRequest);
      }),
      catchError(async err => {
        console.error(`AwsSigningInterceptor pipe:`, err);
        location.reload();
        // await this.router.navigate(['/sign-in']);
        throw new Error(`AwsSigningInterceptor pipe: unable to sign request: ${err.message}`);
      }),
    );

    return res;
  }
}
