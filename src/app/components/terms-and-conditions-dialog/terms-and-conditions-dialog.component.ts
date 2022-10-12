import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerInfo } from 'src/app/models/customer-info.model';
import { SendSmsService } from 'src/app/services/send-sms.service';

@Component({
  selector: 'app-terms-and-conditions-dialog',
  templateUrl: './terms-and-conditions-dialog.component.html',
  styleUrls: ['./terms-and-conditions-dialog.component.scss']
})
export class TermsAndConditionsDialogComponent implements OnInit {

  customerInfo: CustomerInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sendSmsService: SendSmsService,
  ) {
    this.customerInfo = data.customerInfo as CustomerInfo;
   }

  ngOnInit(): void {
  }

  async onSubmit() {
    console.log('onSubmit');
    const res = await this.sendSmsService.subscribeToMarketingSms(this.customerInfo.phone);
    console.log('res =', res);
  }

}
