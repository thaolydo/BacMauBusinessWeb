import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from '@service/auth.service';
import { SendSmsService } from '@service/send-sms.service';
import { AdEvent } from 'src/app/models/send-sms-event.model';

@Component({
  selector: 'app-sms-history',
  templateUrl: './sms-history.component.html',
  styleUrls: ['./sms-history.component.scss']
})
export class SmsHistoryComponent implements OnInit {

  pricePerSms: number | undefined;
  isLoading = false;
  displayedColumns: string[] = ['createdAt', 'description', 'content', 'receivedCount', 'estimatedAudienceSize', 'cost'];

  dataSource: MatTableDataSource<AdEvent> | undefined;
  private sortHodler: MatSort | undefined;
  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) {
      this.sortHodler = sort;
      this.dataSource!.sort = this.sortHodler;
    }
  }

  constructor(
    private sendSmsService: SendSmsService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    console.log('sms-history init');
    await this.loadTableDataSource();
  }

  async loadTableDataSource() {
    console.log('load table');
    this.isLoading = true;
    try {
      const adEvents = await this.sendSmsService.getSmsEvents();
      this.pricePerSms = await this.authService.getSmsCost();
      console.log('adEvents = ', adEvents);
      this.dataSource = new MatTableDataSource<AdEvent>(adEvents);
    } catch (e: any) {
      // TODO: notify admin
      this.dataSource = new MatTableDataSource<AdEvent>();
      alert(e.message);
      throw e;
    } finally {
      this.isLoading = false;
    }
  }

}
