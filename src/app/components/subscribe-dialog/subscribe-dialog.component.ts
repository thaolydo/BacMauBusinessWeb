import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CheckInRequest } from '@model/public-interface/check-in-request.model';
import { PrivacyPolicyDialogComponent } from 'src/app/pages/privacy-policy-dialog/privacy-policy-dialog.component';
import { TermsOfUseDialogComponent } from 'src/app/pages/terms-of-use-dialog/terms-of-use-dialog.component';
import { SendSmsService } from 'src/app/services/send-sms.service';

@Component({
  selector: 'app-subscribe-dialog',
  templateUrl: './subscribe-dialog.component.html',
  styleUrls: ['./subscribe-dialog.component.scss']
})
export class SubscribeDialogComponent implements OnInit {

  isSubmitting = false;
  checkInRequest: CheckInRequest;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sendSmsService: SendSmsService,
    private dialogRef: MatDialogRef<SubscribeDialogComponent>,
    private dialog: MatDialog,
  ) {
    this.checkInRequest = data.checkInRequest as CheckInRequest;
  }

  ngOnInit(): void {
    // this.dialog.open(TermsOfUseDialogComponent);
  }

  async onSubmit() {
    console.log('onSubmit');
    try {
      this.isSubmitting = true;
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await this.sendSmsService.subscribeToMarketingSms(this.checkInRequest.phone!);
      console.log('res =', res);
    } catch (e: any) {
      // TODO: notify admin
      // alert('Unable to subscribe');
      console.log(e);
      alert(`onSubmit: ${e.error.errMsg}`);
    } finally {
      this.isSubmitting = true;
      this.dialogRef.close();
    }
  }

  onOpenTermsOfUse() {
    this.dialog.open(TermsOfUseDialogComponent);
  }

  onOpenPrivacyPolicy() {
    this.dialog.open(PrivacyPolicyDialogComponent);
  }

}
