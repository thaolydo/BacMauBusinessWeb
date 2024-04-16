import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpParams,
  HttpParamsOptions
} from '@angular/common/http';
import { catchError, from, map, mergeMap, Observable, switchMap, tap } from 'rxjs';
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
    const res = from(this.authService.getAwsCredentials().then(
      creds => this.authService.signRequestWithSignatureV4(request, creds!)
    )).pipe(
      catchError(async err => {
        console.error(`AwsSigningInterceptor pipe:`, err);
        await this.router.navigate(['/sign-in']);
        throw new Error(`AwsSigningInterceptor pipe: unable to sign request: ${err.message}`);
      }),
      switchMap(signedRequest => {
        // console.log('signedRequest =', signedRequest);
        return next.handle(signedRequest);
      })
    );

    return res;
  }
}
