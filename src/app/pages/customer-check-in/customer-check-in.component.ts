import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BacMauBusinessService } from '@service/bac-mau-business.service';
import { TermsAndConditionsDialogComponent } from 'src/app/components/terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { CustomerInfo } from 'src/app/model/customer-info.model';

@Component({
  selector: 'app-customer-check-in',
  templateUrl: './customer-check-in.component.html',
  styleUrls: ['./customer-check-in.component.scss']
})
export class CustomerCheckInComponent implements OnInit {
  @ViewChild('formDirective', { static: false }) formDirective: NgForm | undefined;

  form: FormGroup;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayCountInMonth: { [monthName: string]: number } = {
    Jan: 31,
    Feb: 28,
    Mar: 31,
    Apr: 30,
    May: 31,
    Jun: 30,
    Jul: 31,
    Aug: 31,
    Sep: 30,
    Oct: 31,
    Nov: 30,
    Dec: 31
  };
  days: number[] = [];
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private bacMauBusinessService: BacMauBusinessService,
    private dialog: MatDialog,
  ) {
    this.form = this._fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      birthMonth: [null],
      birthDay: {value: null},
    });
  }

  ngOnInit(): void {
  }

  onMonthSelected() {
    const dayCountInSelectedMonth = this.dayCountInMonth[this.form.get('birthMonth')!.value];
    this.days = Array.from({length: dayCountInSelectedMonth}, (_, i) => i + 1);
  }

  async onSubmit() {
    this.isSubmitting = true;
    const customerInfo = this.form.value as CustomerInfo;
    console.log('customerInfo =', customerInfo);

    // Check-in
    await new Promise(r => setTimeout(r, 2000));
    // await this.bacMauBusinessService.saveCustomerInfo(customerInfo);
    this.resetForm();
    this.isSubmitting = false;

    // Open subscribe dialog
    this.dialog.open(TermsAndConditionsDialogComponent, {
      panelClass: 'dialog',
      data: {
        customerInfo,
        businessName: 'Venus', // TODO: use the correct business name
      }
    });
  }

  resetForm() {
    this.form.reset();
    this.formDirective?.resetForm();
  }

}
