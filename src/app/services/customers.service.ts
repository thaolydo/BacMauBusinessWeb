import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { CheckInEvent } from 'src/app/models/check-in-event.model';
import { TimeUtil } from '../utils/time.util';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  async getCustomers(): Promise<CustomerInfo[]> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customer`)
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

  async checkIn(customer: CustomerInfo): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/check-in`, { ...customer }));
  }

  async getCheckInEventHistory(month: number, date?: Date): Promise<CheckInEvent[]> {
    // console.log('date =', date);
    // console.log('month =', month);
    const params = { month, year: new Date().getFullYear(), date: date?.toISOString() } as any;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      params.start = start.getTime();
      params.end = end.getTime();
    }
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/check-in`, {
      params,
    }).pipe(
      map(res => (res.paginatedItems.items as any[]).
        map(item => {
          return {
            ...item,
            createdAt: TimeUtil.parseTimeString(item.createdAt).valueOf(),
          }
        }))
    ));
  }

  async optOutCustomer(cid: string): Promise<any> {
    return firstValueFrom(this.http.put(`${this.baseUrl}/opt-out`, {
      cid,
    }));
  }

  // Deprecated in favor of get-estimated-customer-count
  // async getCustomerCount(): Promise<number> {
  //   console.log('Getting customer count');
  //   return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-customer-count`).pipe(
  //     map(res => res.count as number)
  //   ));
  // }

}
