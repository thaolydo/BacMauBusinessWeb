import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomerInfo } from '@model/customer-info.model';
import { CustomersService } from '@service/customers.service';

@Component({
  selector: 'app-update-customer-dialog',
  templateUrl: './update-customer-dialog.component.html',
  styleUrl: './update-customer-dialog.component.scss'
})
export class UpdateCustomerDialogComponent {

  isSubmitting = false;
  customerInfo: CustomerInfo;
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private customersService: CustomersService,
    private dialogRef: MatDialogRef<UpdateCustomerDialogComponent>,
    private _fb: FormBuilder,
  ) {
    this.customerInfo = data.customerInfo as CustomerInfo;
    this.form = this._fb.group({
      phone: [{ value: this.customerInfo.phone, disabled: true }],
      notes: [this.customerInfo.notes]
    });
  }

  async onSubmit() {
    console.log('onSubmit');
    try {
      this.isSubmitting = true;
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // const res = await this.sendSmsService.subscribeToMarketingSms(this.customerInfo.cid!);
      // console.log('res =', res);
    } catch (e: any) {
      // TODO: notify admin
      // alert('Unable to subscribe');
      console.log(e);
      alert(`Unable to save customer: ${e.error.errMsg}`);
    } finally {
      this.isSubmitting = true;
      this.dialogRef.close();
    }
  }
}
