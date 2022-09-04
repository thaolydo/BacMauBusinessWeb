import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { BacMauBusinessService } from 'src/app/bac-mau-business.service';
import { CustomerInfo } from 'src/app/model/customer-info.model';

@Component({
  selector: 'app-customer-check-in',
  templateUrl: './customer-check-in.component.html',
  styleUrls: ['./customer-check-in.component.scss']
})
export class CustomerCheckInComponent implements OnInit {
  @ViewChild('formDirective', {static: false}) formDirective: NgForm | undefined;

  form: FormGroup;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private _fb: FormBuilder,
    private bacMauBusinessService: BacMauBusinessService,
    ) {
    this.form = this._fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      birthday: [new Date()],
    });
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    const customerInfo = this.form.value as CustomerInfo;
    const birthDayInMMDDYYY = (this.form.get('birthday')?.value as Date)?.toLocaleDateString();
    customerInfo.birthday = birthDayInMMDDYYY;
    console.log('customerInfo =', customerInfo);
    // await this.bacMauBusinessService.saveCustomerInfo(customerInfo);
    this.resetForm();
  }

  resetForm() {
    this.form.reset();
    this.formDirective?.resetForm();
  }

}
