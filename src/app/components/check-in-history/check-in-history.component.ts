import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CheckInEvent } from 'src/app/models/check-in-event.model';
import { CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-check-in-history',
  templateUrl: './check-in-history.component.html',
  styleUrls: ['./check-in-history.component.scss']
})
export class CheckInHistoryComponent implements OnInit {

  groupBy = 'day';
  selectedDate = new Date();
  selectedMonth = new Date().getMonth() + 1;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  isLoading = false;
  displayedColumns: string[] = ['phone', 'name', 'createdAt'];

  dataSource: MatTableDataSource<CheckInEvent> | undefined;
  private sortHodler: MatSort | undefined;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.sortHodler = sort;
      this.dataSource!.sort = this.sortHodler;
    }
  }

  constructor(private customersService: CustomersService) { }

  async ngOnInit() {
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    this.isLoading = true;
    try {
      // await new Promise((x) => setTimeout(x, 1000));
      // const checkInEvents: CheckInEvent[] = [
      //   { phone: '1234', name: 'huy', timestamp: new Date().toISOString() },
      //   { phone: '434', name: 'ly', timestamp: new Date().toISOString() },
      //   { phone: '546456', name: 'ac', timestamp: new Date().toISOString() },
      // ];
      const curMonth = new Date().getMonth() + 1;
      const checkInEvents = await this.customersService.getCheckInEventHistory(this.selectedMonth + 1, this.groupBy == 'day' ? this.selectedDate : undefined);
      console.log('checkInEvents =', checkInEvents);
      this.dataSource = new MatTableDataSource<CheckInEvent>(checkInEvents);
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async onGroupBy() {
    console.log('on group by');
    await this.loadTableDataSource();
  }

  async onDateSelected() {
    console.log('selectedDate =', this.selectedDate.getTime());
    this.selectedMonth = this.selectedDate.getMonth();
    await this.loadTableDataSource();
  }

  async onMonthSelected() {
    console.log('selectedMonth =', this.selectedMonth);
    this.selectedDate.setMonth(this.selectedMonth);
    await this.loadTableDataSource();
  }

}
