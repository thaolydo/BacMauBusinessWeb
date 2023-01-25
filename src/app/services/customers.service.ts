import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { CheckInEvent } from 'src/app/models/check-in-event.model';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
  ) { }

  async getCustomers(): Promise<CustomerInfo[]> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-all-customers-info`)
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

  // Deprecated
  async uploadCustomers(customers: CustomerInfo[]) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers`, { customers }));
  }

  async checkIn(customer: CustomerInfo): Promise<any> {
    return firstValueFrom(this.http.post(`${this.baseUrl}/check-in`, { customer }));
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
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-check-in-event`, {
      params,
    }).pipe(
      map(res => res.paginatedItems.items)
    ));
  }

  async getCustomerCount(): Promise<number> {
    console.log('Getting customer count');
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/get-customer-count`).pipe(
      map(res => res.count as number)
    ));
  }

}
