import { DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CustomerInfo, OptStatus } from 'src/app/models/customer-info.model';
import { CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, AfterViewInit {

  OptStatus: any = OptStatus;
  isLoading = false;
  displayedColumns: string[] = ['phone', 'createdAt', 'lastUpdatedAt', 'name', 'latestOptStatus'];
  dataSource: MatTableDataSource<CustomerInfo> = new MatTableDataSource<CustomerInfo>();

  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(private customersService: CustomersService) { }

  async ngOnInit() {
    console.log('customer-list: init');
    await this.loadTableDataSource();
  }

  ngAfterViewInit() {
    console.log('ng after view init', this.sort);
    if (this.dataSource) {
      this.dataSource.sort = this.sort ? this.sort : null;
    }
  }

  async loadTableDataSource() {
    this.isLoading = true;
    try {
      const customers = await this.customersService.getCustomers();
      console.log('customers =', customers);
      // (customers as any[]).forEach(customer => customer.checked = customer.latestOptStatus == OptStatus.IN);
      this.dataSource = new MatTableDataSource<CustomerInfo>(customers);
      this.dataSource.sort = this.sort!;
    } catch (e: any) {
      // TODO: notify admin
      this.dataSource = new MatTableDataSource<CustomerInfo>();
      alert(`loadTableDataSource: ${e.message}`);
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async optOutCustomer(element: any, toggle: MatSlideToggle) {
    console.log(`Opting out customer: ${element.phone}`);
    element.isSubmitting = true;
    try {
      element.latestOptStatus = OptStatus.OUT;
      await this.customersService.optOutCustomer(element.phone!);
      // await new Promise(x => setTimeout(x, 1000));
      // throw new Error();
    } catch (e: any) {
      // TODO: notify admin
      alert('optOutCustomer: Unable to update the opt status');
      element.latestOptStatus = OptStatus.IN;
      toggle.checked = true;
    } finally {
      element.isSubmitting = false;
    }
  }

  announceSortChange(sortState: Sort) {
    console.log('announceSortChange: ', sortState, this.sort);
    if (this.dataSource) {
      this.dataSource.sort = this.sort ? this.sort : null;
    }
  }

}
