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

  constructor(private http: HttpClient) { }

  getCustomers(): Promise<CustomerInfo[]> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customers`)
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

  uploadCustomers(customers: CustomerInfo[]) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers`, { customers }));
  }

  checkIn(customer: CustomerInfo) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers/check-in`, { customer }));
  }

  getCheckInEventHistory(month: number, date?: Date): Promise<CheckInEvent[]> {
    const params = { month, date: date?.toISOString() } as any;
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      params.start = start.getTime();
      params.end = end.getTime();
    }
    console.log('params =', params);
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customers/check-in`, {
      params
    }).pipe(
      map(res => res.paginatedItems.items)
    ));
  }

}
