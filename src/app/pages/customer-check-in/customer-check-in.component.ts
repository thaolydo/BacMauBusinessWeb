import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { CheckInRequest } from '@model/public-interface/check-in-request.model';
import { AuthService } from '@service/auth.service';
import { CustomersService } from '@service/customers.service';
import { HuyService } from '@service/huy.service';
import { firstValueFrom } from 'rxjs';
import { CheckInSuccessDialogComponent } from 'src/app/components/check-in-success-dialog/check-in-success-dialog.component';
import { SubscribeDialogComponent } from 'src/app/components/subscribe-dialog/subscribe-dialog.component';
import { CustomerInfo } from 'src/app/models/customer-info.model';

@Component({
  selector: 'app-customer-check-in',
  templateUrl: './customer-check-in.component.html',
  styleUrls: ['./customer-check-in.component.scss'],
})
export class CustomerCheckInComponent implements OnInit {
  @ViewChild('firstFormDirective', { static: false }) firstFormDirective: NgForm | undefined;
  @ViewChild('secondFormDirective', { static: false }) secondFormDirective: NgForm | undefined;
  @ViewChild('stepper', { static: false }) stepper: MatStepper | undefined;

  firstForm: FormGroup;
  secondForm: FormGroup;
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
  customerProfile: CustomerInfo | undefined = undefined;
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private customersService: CustomersService,
    private dialog: MatDialog,
    private authService: AuthService,
    private huyService: HuyService,
  ) {
    this.firstForm = this._fb.group({
      phone: ['', Validators.required],
    });
    this.secondForm = this._fb.group({
      name: ['', Validators.required],
      birthMonth: [null],
      birthDay: [null],
    });
  }

  get name() {
    return this.secondForm.get('name')?.value;
  }

  set name(val: string) {
    this.secondForm.get('name')?.setValue(val);
  }

  get phone() {
    return this.firstForm.get('phone')?.value;
  }

  set phone(val: string) {
    this.firstForm.get('phone')?.setValue(val);
  }

  get birthDay() {
    return this.secondForm.get('birthDay')?.value;
  }

  set birthDay(val: number) {
    this.secondForm.get('birthDay')?.setValue(val);
  }

  get birthMonth() {
    return this.secondForm.get('birthMonth')?.value;
  }

  set birthMonth(val: number) {
    this.secondForm.get('birthMonth')?.setValue(val);
    this.onMonthSelected();
  }

  async ngOnInit() {
    // const dialogRef = this.dialog.open(SubscribeDialogComponent, {
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
    const dayCountInSelectedMonth = this.dayCountInMonth[this.secondForm.get('birthMonth')!.value];
    this.days = Array.from({ length: dayCountInSelectedMonth }, (_, i) => i + 1);
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      this.customerProfile = await this.customersService.getCustomerProfile(`+1${this.phone}`);
      this.stepper?.next();
      console.log('customerProfile =', this.customerProfile);
      if (this.customerProfile) {
        this.name = this.customerProfile.name;
        this.birthMonth = this.customerProfile.birthMonth;
        this.birthDay = this.customerProfile.birthDay;
      }

    } catch (e: any) {
      // TODO: notify admin
      console.log(e);
      alert(`onSubmit: ${e.error.errMsg}. If this persists, please contact admin.`);
    } finally {
      this.isSubmitting = false;
    }
  }

  async onCheckIn() {
    this.isSubmitting = true;
    try {
      const checkInRequest = { phone: `+1${this.phone}` } as CheckInRequest;
      checkInRequest.name = this.name;
      if (!this.secondForm.pristine) {
        checkInRequest.updateInfo = true;
        checkInRequest.birthDay = this.birthDay;
        checkInRequest.birthMonth = this.birthMonth;
        checkInRequest.newCustomer = this.customerProfile ? false : true;
      }
      console.log('checkInRequest =', checkInRequest);

      // Check-in
      // await new Promise(resolve => setTimeout(resolve, 1000));
      // const res = {} as any;
      const res = await this.customersService.checkIn(checkInRequest);
      this.isSubmitting = false;

      const alreadySubsribed = res.subscribed;

      // If phone is invalid
      if (res.isCidInvalid) {
        alert(res.invalidMessage);
      } else if (!alreadySubsribed) {
        // Open subscribe dialog
        // const businessName = 'Venus Spa'; //await this.authService.getDefaultBusinessName();
        const businessName = await this.authService.getDefaultBusinessName();
        const dialogRef = this.dialog.open(SubscribeDialogComponent, {
          panelClass: 'dialog',
          data: {
            checkInRequest,
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
      alert(`onCheckIn: ${e.error.errMsg}. If this persists, please contact admin.`);
    } finally {
      this.isSubmitting = false;
    }

  }

  resetForm() {
    this.customerProfile = undefined;
    this.firstForm.reset();
    this.secondForm.reset();
    this.firstFormDirective?.resetForm();
    this.stepper?.reset();
  }

}
