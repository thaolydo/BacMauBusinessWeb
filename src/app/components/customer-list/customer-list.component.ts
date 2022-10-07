import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {

  isLoading = false;
  displayedColumns: string[] = ['phone', 'name', 'birthday'];
  dataSource: MatTableDataSource<CustomerInfo> | undefined;

  constructor(private customersService: CustomersService) { }

  async ngOnInit() {
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    this.isLoading = true;
    try {
      const customers = await this.customersService.getCustomers();
      console.log('customers =', customers);
      this.dataSource = new MatTableDataSource<CustomerInfo>(customers);
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
