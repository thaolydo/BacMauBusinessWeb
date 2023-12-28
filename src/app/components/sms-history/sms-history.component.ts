import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SendSmsService } from '@service/send-sms.service';
import { SendSmsEvent } from 'src/app/models/send-sms-event.model';

@Component({
  selector: 'app-sms-history',
  templateUrl: './sms-history.component.html',
  styleUrls: ['./sms-history.component.scss']
})
export class SmsHistoryComponent implements OnInit {

  isLoading = false;
  displayedColumns: string[] = ['createdAt', 'description', 'content'];

  dataSource: MatTableDataSource<SendSmsEvent> | undefined;
  private sortHodler: MatSort | undefined;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.sortHodler = sort;
      this.dataSource!.sort = this.sortHodler;
    }
  }

  constructor(
    private sendSmsService: SendSmsService,
  ) { }

  async ngOnInit() {
    console.log('sms-history init');
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    console.log('load table');
    this.isLoading = true;
    try {
      const sendSmsEvents = await this.sendSmsService.getSmsEvents();
      console.debug('sendSmsEvents = ', sendSmsEvents);
      this.dataSource = new MatTableDataSource<SendSmsEvent>(sendSmsEvents);
    } catch (e: any) {
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
