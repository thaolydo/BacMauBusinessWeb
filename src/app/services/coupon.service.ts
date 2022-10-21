import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CouponStatus } from '../models/coupon-status.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  async getCouponStatus(couponCode: string): Promise<CouponStatus> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/getCouponStatus`, {
      headers: await this._buildCommonHeaders(),
      params: {
        coupon: couponCode
      }
    })
      .pipe(
        map(res => res.res.couponStatus)
      ));
  }

  async markCouponUsed(couponCode: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/saveCoupon`, {
      coupon: couponCode,
      status: 'USED'
    }, {
      headers: await this._buildCommonHeaders()
    }));
  }

  private async _buildCommonHeaders(): Promise<any> {
    const curUser = await this.authService.getCurUser();
    return {
      Authorization: curUser?.getSignInUserSession()?.getAccessToken().getJwtToken()
    }
  }
}
