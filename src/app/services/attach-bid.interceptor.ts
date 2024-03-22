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
    console.debug(`AttachBidInterceptor: intercepting http requests`);
    const res = from(this.authService.getUserData().then(
      userData => {
        const bid = userData.UserAttributes.find(attribute => attribute.Name === 'custom:bid')!.Value;
        console.debug('bid =', bid);
        if (request.method == 'GET') {
          return request.clone({
            params: request.params.append('bid', bid),
          });
        } else if (request.method == 'POST') {
          const businessName = userData.UserAttributes.find(attribute => attribute.Name === 'custom:businessName')!.Value;
          const body = request.body! as any;
          body.bid = bid;
          body.businessName = businessName;
          return request.clone({
            body
          });
        } else {
          return request;
        }
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
