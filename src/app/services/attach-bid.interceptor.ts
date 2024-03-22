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
export class AttachBidInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log(`AttachBidInterceptor: intercepting http requests`);
    const res = from(this.authService.getDefaultBid().then(
      bid => {
        console.log('bid =', bid);
        return request.clone({
          params: request.params.append('bid', bid),
        })
      }
    )).pipe(
      switchMap(signedRequest => {
        // console.log('signedRequest =', signedRequest);
        return next.handle(signedRequest);
      })
    );

    return res;
  }
}
