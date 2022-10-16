import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { CheckInEvent } from 'src/app/models/check-in-event.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) { }

  async getCustomers(): Promise<CustomerInfo[]> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customers`, {
      headers: await this._buildCommonHeaders()
    })
      .pipe(
        map(res => {
          const customers = Object.values(res.customers) as any[];
          for (const customer of customers) {
            customer.phone = customer.cid;
            delete customer.cid;
          }
          return customers;
        })
      ));
  }

  async uploadCustomers(customers: CustomerInfo[]) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers`, { customers }, {
      headers: await this._buildCommonHeaders()
    }));
  }

  async checkIn(customer: CustomerInfo): Promise<any> {
    customer.cid = customer.phone;
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers/check-in`, { customer }, {
      headers: await this._buildCommonHeaders()
    }));
  }

  async getCheckInEventHistory(month: number, date?: Date): Promise<CheckInEvent[]> {
    const params = { month, date: date?.toISOString() } as any;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      params.start = start.getTime();
      params.end = end.getTime();
    }
    console.log('params =', params);
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customers/check-in`, {
      params,
      headers: await this._buildCommonHeaders()
    }).pipe(
      map(res => res.paginatedItems.items)
    ));
  }

  private async _buildCommonHeaders(): Promise<any> {
    const curUser = await this.authService.getCurUser();
    console.log('curUser?.getSignInUserSession()?.getAccessToken =', curUser?.getSignInUserSession()?.getAccessToken().getJwtToken());
    return {
      Authorization: curUser?.getSignInUserSession()?.getAccessToken().getJwtToken()
    }
  }

}
