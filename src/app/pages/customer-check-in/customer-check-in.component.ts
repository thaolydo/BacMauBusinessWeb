import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@service/auth.service';
import { CustomersService } from '@service/customers.service';
import { HuyService } from '@service/huy.service';
import { firstValueFrom } from 'rxjs';
import { CheckInSuccessDialogComponent } from 'src/app/components/check-in-success-dialog/check-in-success-dialog.component';
import { TermsAndConditionsDialogComponent } from 'src/app/components/terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { CustomerInfo } from 'src/app/models/customer-info.model';

@Component({
  selector: 'app-customer-check-in',
  templateUrl: './customer-check-in.component.html',
  styleUrls: ['./customer-check-in.component.scss'],
})
export class CustomerCheckInComponent implements OnInit {
  @ViewChild('formDirective', { static: false }) formDirective: NgForm | undefined;

  form: FormGroup;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayCountInMonth: { [monthName: string]: number } = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
  };
  days: number[] = [];
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private customersService: CustomersService,
    private dialog: MatDialog,
    private authService: AuthService,
    private huyService: HuyService,
  ) {
    this.form = this._fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      birthMonth: [null],
      birthDay: {value: null},
    });
  }

  get name() {
    return this.form.get('name')?.value;
  }

  set name(val: string) {
    this.form.get('name')?.setValue(val);
  }

  get phone() {
    return this.form.get('phone')?.value;
  }

  set phone(val: string) {
    this.form.get('phone')?.setValue(val);
  }

  async ngOnInit() {
    // const dialogRef = this.dialog.open(TermsAndConditionsDialogComponent, {
    //   panelClass: 'dialog',
    //   data: {
    //     customerInfo: {},
    //     businessName: '',
    //   }
    // });
    // const res = await this.huyService.getHuy();
    // console.log('res =', res);
  }

  onMonthSelected() {
    const dayCountInSelectedMonth = this.dayCountInMonth[this.form.get('birthMonth')!.value];
    this.days = Array.from({length: dayCountInSelectedMonth}, (_, i) => i + 1);
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const customerInfo = this.form.value as CustomerInfo;
      customerInfo.cid = `+1${customerInfo.phone}`;
      console.log('customerInfo =', customerInfo);

      // Check-in
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // const res = {} as any;
      const res = await this.customersService.checkIn(customerInfo);
      this.isSubmitting = false;

      const alreadySubsribed = res.subscribed;

      // If phone is invalid
      // if (res.isCidInvalid) {
      //   alert(res.invalidMessage);
      //   return;
      // }

      // Open subscribe dialog
      if (!alreadySubsribed) {
        const businessName = await this.authService.getDefaultBusinessName();
        const dialogRef = this.dialog.open(TermsAndConditionsDialogComponent, {
          panelClass: 'dialog',
          data: {
            customerInfo,
            businessName,
          }
        });
        await firstValueFrom(dialogRef.afterClosed());
      }

      // Display successful checkin popup
      const dialogRef = this.dialog.open(CheckInSuccessDialogComponent);
      setTimeout(() => {
        dialogRef.close();
      }, 3000);

      this.resetForm();
    } catch (e: any) {
      // TODO: notify admin
      console.log(e);
      alert(`onSubmit: ${e.error.errMsg}`);
    } finally {
      this.isSubmitting = false;
    }

  }

  resetForm() {
    this.form.reset();
    this.formDirective?.resetForm();
  }

}
