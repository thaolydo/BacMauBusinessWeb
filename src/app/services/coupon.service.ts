import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CouponStatus } from '../models/coupon-status.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getCouponStatus(couponCode: string): Promise<CouponStatus> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/coupon`)
      .pipe(
        map(res => res.status)
      ));
  }

  markCouponUsed(couponCode: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/coupon`, undefined));
  }
}
