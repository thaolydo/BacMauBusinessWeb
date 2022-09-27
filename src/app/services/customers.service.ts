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
        const customers = Object.values(res) as any[];
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

  getCheckInEventHistory(month: number): Promise<CheckInEvent[]> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/customers/check-in`, {
      params: {
        month
      }
    }).pipe(
      map(res => res.paginatedItems.items)
    ));
  }

}
