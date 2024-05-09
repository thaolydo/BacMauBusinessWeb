import { DataSource } from '@angular/cdk/collections';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
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

  private LastEvaluatedKey: any = undefined;

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
      const paginatedItems = await this.customersService.getCustomers(undefined, 10);
      this.LastEvaluatedKey = paginatedItems.LastEvaluatedKey;
      console.log('customers =', paginatedItems);
      (paginatedItems.items as any[]).forEach(customer => customer.checked = customer.latestOptStatus == OptStatus.IN);
      this.dataSource = new MatTableDataSource<CustomerInfo>(paginatedItems.items);
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

  // add() {
  //   console.log('adding');
  //   const newCustomers: CustomerInfo[] = [
  //     {
  //       name: 'Huy',
  //       phone: 'hi',
  //     } as CustomerInfo
  //   ];
  //   this.dataSource.data.push(...newCustomers);
  //   this.dataSource._updateChangeSubscription();
  //   console.log('data =', this.dataSource.data);
  // }

  @HostListener('window:scroll', ['$event'])
  async onScroll(event: any) {
    // Window scroll position
    let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;

    // Maximum scroll height
    let max = document.documentElement.scrollHeight;

    // Check if we are at the bottom of the page
    if (pos === max) {
      console.log('Reached the bottom');
      await this.getMoreData();
    }
  }

  async getMoreData() {
    if (this.noMoreItem) {
      console.log('no more items');
      return;
    }
    const paginatedItems = await this.customersService.getCustomers(JSON.stringify(this.LastEvaluatedKey));
    this.LastEvaluatedKey = paginatedItems.LastEvaluatedKey;
    this.dataSource.data.push(...paginatedItems.items);
    this.dataSource._updateChangeSubscription();
  }

  get noMoreItem(): boolean {
    return !this.LastEvaluatedKey || Object.keys(this.LastEvaluatedKey).length === 0;
  }

  async refresh() {
    this.dataSource = new MatTableDataSource<CustomerInfo>();
    await this.loadTableDataSource();
  }

}
