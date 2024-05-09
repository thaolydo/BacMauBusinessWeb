import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { CheckInEvent } from 'src/app/models/check-in-event.model';
import { TimeUtil } from '../utils/time.util';
import { DateTime } from 'luxon';
import { PaginatedResult } from '@model/public-interface/paginated-result.model';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  async getCustomers(ExclusiveStartKey?: string, limit?: number): Promise<PaginatedResult<CustomerInfo>> {
    const queryParams: any = {
      ascending: false,
    };
    if (ExclusiveStartKey) {
      queryParams.ExclusiveStartKey = ExclusiveStartKey;
    }
    if (limit) {
      queryParams.limit = limit;
    }
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customer`, {
      params: queryParams,
    })
      .pipe(
        map(res => {
          console.log('res =', res);
          const paginatedItems = res.paginatedItems as PaginatedResult<CustomerInfo>;
          const customers = paginatedItems.items;
          for (const customer of customers) {
            customer.phone = customer.cid!;
            delete customer.cid;
          }
          return paginatedItems;
        })
      ));
  }

  async checkIn(customer: CustomerInfo): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/check-in`, { ...customer }));
  }

  async getCheckInEventHistory(month: number, date?: Date): Promise<CheckInEvent[]> {
    // console.log('date =', date);
    // console.log('month =', month);
    const params = { } as any;
    if (date) {
      // date selected
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      params.start = start.getTime();
      params.end = end.getTime();
    } else {
      // month selected
      params.start = TimeUtil.getBeginOfMonth(month).toMillis();
      params.end = TimeUtil.getEndOfMonth(month).toMillis();
    }
    console.log('start =', params.start);
    console.log('end =', params.end);
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
