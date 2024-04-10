import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CheckInEvent } from 'src/app/models/check-in-event.model';
import { CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-check-in-history',
  templateUrl: './check-in-history.component.html',
  styleUrls: ['./check-in-history.component.scss']
})
export class CheckInHistoryComponent implements OnInit, AfterViewInit {

  groupBy: 'date' | 'month' = 'date';
  selectedDate = new Date();
  selectedMonth = new Date().getMonth();
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

  constructor(
    private customersService: CustomersService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  async ngOnInit() {
    console.log('check-in: init');
    const queryParams = this.route.snapshot.queryParams;
    console.log('check-in: queryParams');
    const month = queryParams['month'];
    if (month) {
      this.selectedMonth = parseInt(month) - 1;
      this.groupBy = 'month';
    }
    const date = queryParams['date'] as string;
    if (date) {
      const dateParts = date.split('-');
      this.selectedDate = new Date(
        parseInt(dateParts[0]),
        parseInt(dateParts[1]) - 1,
        parseInt(dateParts[2]));
      this.groupBy = 'date';
    }
    if (!month && !date) {
      setTimeout(async () => {
        await this.updateDateInQueryParams();
      }, 0);
    }
    await this.loadTableDataSource();
  }

  async ngAfterViewInit() {
  }

  async loadTableDataSource() {
    console.log('date =', JSON.stringify(this.selectedDate));
    console.log('month =', this.selectedMonth + 1);
    // if (true) return;
    this.isLoading = true;
    try {
      const curMonth = new Date().getMonth() + 1;
      const checkInEvents = await this.customersService.getCheckInEventHistory(this.selectedMonth + 1, this.groupBy == 'date' ? this.selectedDate : undefined);
      console.log('checkInEvents =', checkInEvents);
      this.dataSource = new MatTableDataSource<CheckInEvent>(checkInEvents);
    } catch (e: any) {
      // TODO: notify admin
      this.dataSource = new MatTableDataSource<CheckInEvent>();
      alert(e.message);
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

  async onGroupBy() {
    console.log('on group by');
    if (this.groupBy == 'date') {
      await this.updateDateInQueryParams();
    } else {
      await this.updateMonthInQueryParams();
    }
    await this.loadTableDataSource();
  }

  async onDateSelected() {
    console.log('selectedDate =', JSON.stringify(this.selectedDate));
    this.selectedMonth = this.selectedDate.getMonth();

    // Append date to query params
    this.updateDateInQueryParams();
    await this.loadTableDataSource();
  }

  async onMonthSelected() {
    console.log('selectedMonth =', this.selectedMonth);
    this.selectedDate.setMonth(this.selectedMonth);

    // Append month to query params
    await this.updateMonthInQueryParams();
    await this.loadTableDataSource();
  }

  private async updateDateInQueryParams() {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        month: null, // clear month query param
        date: `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}`,
      },
      queryParamsHandling: 'merge',
    });
  }

  private async updateMonthInQueryParams() {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        date: null, // clear date query param
        month: this.selectedMonth + 1,
      },
      queryParamsHandling: 'merge',
    });
  }

}
