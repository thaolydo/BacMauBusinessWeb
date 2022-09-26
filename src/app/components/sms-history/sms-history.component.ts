import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SendSmsEvent } from '@model/send-sms-event.model';

@Component({
  selector: 'app-sms-history',
  templateUrl: './sms-history.component.html',
  styleUrls: ['./sms-history.component.scss']
})
export class SmsHistoryComponent implements OnInit {

  isLoading = false;
  displayedColumns: string[] = ['createdAt', 'content', 'imageUrl'];

  dataSource: MatTableDataSource<SendSmsEvent> | undefined;
  private sortHodler: MatSort | undefined;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.sortHodler = sort;
      this.dataSource!.sort = this.sortHodler;
    }
  }

  constructor() { }

  async ngOnInit() {
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    this.isLoading = true;
    try {
      // TODO: get data from backend
      await new Promise((x) => setTimeout(x, 1000));
      const sendSmsEvents: SendSmsEvent[] = [
        { createdAt: new Date().toISOString(), content: 'hello', imageUrl: 'djjf' },
        { createdAt: new Date('2022-09-28').toISOString(), content: 'hi', imageUrl: 'djjf' },
        { createdAt: new Date().toISOString(), content: 'kdlj', imageUrl: 'djjf' },
      ];
      this.dataSource = new MatTableDataSource<SendSmsEvent>(sendSmsEvents);
      // this.dataSource.sort = this.sort ? this.sort : null;
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
