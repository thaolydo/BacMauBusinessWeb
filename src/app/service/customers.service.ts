import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from '@model/customer-info.model';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getCustomers(): Promise<CustomerInfo[]> {
    return firstValueFrom(this.http.get<CustomerInfo[]>(`${this.baseUrl}/customers`));
  }

  uploadCustomers(customers: CustomerInfo[]) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers`, { customers }));
  }

  checkIn(customer: CustomerInfo) {
    return firstValueFrom(this.http.post(`${this.baseUrl}/customers/checkin`, { customer }));
  }

}
