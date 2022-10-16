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
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/coupon`, {
      headers: await this._buildCommonHeaders()
    })
      .pipe(
        map(res => res.status)
      ));
  }

  async markCouponUsed(couponCode: string) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/coupon`, undefined, {
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
