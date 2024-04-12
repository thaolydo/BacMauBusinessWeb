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
import { from, map, mergeMap, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AwsSigningInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const interceptHeader = request.headers.get('X-Intercept');
    if (interceptHeader === 'false') {
      console.log('Skipping AttachBidInterceptor');
      next.handle(request);
    }
    const res = from(this.authService.getAwsCredentials().then(
      creds => this.authService.signRequestWithSignatureV4(request, creds!)
    )).pipe(
      switchMap(signedRequest => {
        // console.log('signedRequest =', signedRequest);
        return next.handle(signedRequest);
      })
    );

    return res;
  }
}
