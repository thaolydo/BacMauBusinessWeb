import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CheckInEvent } from '@model/check-in-event.model';

@Component({
  selector: 'app-check-in-history',
  templateUrl: './check-in-history.component.html',
  styleUrls: ['./check-in-history.component.scss']
})
export class CheckInHistoryComponent implements OnInit {

  isLoading = false;
  displayedColumns: string[] = ['phone', 'name', 'timestamp'];

  dataSource: MatTableDataSource<CheckInEvent> | undefined;

  constructor() { }

  async ngOnInit() {
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    this.isLoading = true;
    try {
      // TODO: get data from backend
      await new Promise((x) => setTimeout(x, 1000));
      const checkInEvents: CheckInEvent[] = [
        { phone: '1234', name: 'huy', timestamp: new Date().toISOString() },
        { phone: '434', name: 'ly', timestamp: new Date().toISOString() },
        { phone: '546456', name: 'ac', timestamp: new Date().toISOString() },
      ];
      this.dataSource = new MatTableDataSource<CheckInEvent>(checkInEvents);
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
