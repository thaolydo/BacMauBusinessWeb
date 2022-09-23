import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SendSmsEvent } from '@model/send-sms-event.model';

@Component({
  selector: 'app-sms-history',
  templateUrl: './sms-history.component.html',
  styleUrls: ['./sms-history.component.scss']
})
export class SmsHistoryComponent implements OnInit {

  isLoading = false;
  displayedColumns: string[] = ['timestamp', 'content', 'imageUrl'];

  dataSource: MatTableDataSource<SendSmsEvent> | undefined;

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
        { timestamp: new Date().toISOString(), content: 'hello', imageUrl: 'djjf' },
        { timestamp: new Date().toISOString(), content: 'hi', imageUrl: 'djjf' },
        { timestamp: new Date().toISOString(), content: 'kdlj', imageUrl: 'djjf' },
      ];
      this.dataSource = new MatTableDataSource<SendSmsEvent>(sendSmsEvents);
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
