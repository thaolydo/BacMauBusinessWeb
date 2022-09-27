import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CouponStatus } from 'src/app/models/coupon-status.model';
import { CouponService } from 'src/app/services/coupon.service';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.scss']
})
export class CouponComponent implements OnInit {

  couponCode: string = '';
  couponStatus: CouponStatus | undefined;
  isSubmitting: boolean = false;
  isMarkingUsed: boolean = false;
  couponCodePattern = {
    '0': {
      pattern: /[a-zA-Z0-9]/
    }
  }

  constructor(
    private couponService: CouponService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      // TODO: call get coupon status API
      await new Promise((x) => setTimeout(x, 1000));
      this.couponStatus = CouponStatus.VALID; // await this.couponService.getCouponStatus(this.couponCode);
    } finally {
      this.isSubmitting = false;
    }
  }

  onInput() {
    this.couponCode = this.couponCode.toUpperCase();
    this.couponStatus = undefined;
  }

  async onMarkUsed() {
    console.log('onMarkUsed');
    this.isMarkingUsed = true;
    try {
      await new Promise((x) => setTimeout(x, 1000));
      // TODO: call mark used API
      // await this.couponService.markCouponUsed(this.couponCode);
      this.snackBar.open(`Coupon '${this.couponCode}' is marked as USED`, 'dismiss', { duration: 3000 });
      this.couponStatus = CouponStatus.USED;
    } finally {
      this.isMarkingUsed = false;
    }
  }

}
