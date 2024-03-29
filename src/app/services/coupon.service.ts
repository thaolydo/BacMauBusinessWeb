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

  constructor(
    private http: HttpClient,
  ) { }

  async getCouponStatus(couponCode: string): Promise<CouponStatus> {
    console.log('getCouponStatus');
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-coupon-status`, {
      params: {
        coupon: couponCode,
      },
    })
      .pipe(
        map(res => res.couponStatus)
      ));
  }

  async markCouponUsed(couponCode: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/save-coupon`, {
      coupon: couponCode,
      status: 'USED'
    }));
  }

}
