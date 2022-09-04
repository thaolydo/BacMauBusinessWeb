import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerInfo } from './model/customer-info.model';

@Injectable({
  providedIn: 'root'
})
export class BacMauBusinessService {

  baseUrl = environment.baseUrl;

  constructor(private httpClient: HttpClient) { }

  saveCustomerInfo(customerInfo: CustomerInfo): Promise<void> {
    console.debug('Saving customer info');
    return firstValueFrom(this.httpClient.post<void>(`${this.baseUrl}/customer-info`, customerInfo));
  }
}
