import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@service/auth.service';
import { CustomersService } from '@service/customers.service';
import { SendSmsService } from 'src/app/services/send-sms.service';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {

  imageUrls: string[] = [];
  messageContent = 'Get 30% off today only.';
  description = 'Friday 30% OFF';
  includeClickThroughLink = false;
  selectedImage: string | undefined = undefined;
  isLoading = false;
  isSending: boolean = false;
  uploadingImage = false;
  customerCount: number | undefined;
  MAX_SMS_CHAR: number = 160;
  CLICK_THROUGH_LINK_LENGTH: number = 38;
  maxChar: number = this.MAX_SMS_CHAR;
  pricePerSms: number | undefined;

  @ViewChild('imageUploadInput') imageUploadInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    private sendSmsService: SendSmsService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    console.log('send-sms init');
    this.isLoading = true;
    try {
      // this.imageUrls = await this.sendSmsService.getImageUrls();
      this.customerCount = await this.sendSmsService.getEstimatedCustomerCount();
      this.pricePerSms = await this.authService.getSmsCost();
      console.log('customerCount =', this.customerCount);
    } finally {
      this.isLoading = false;
    }
  }

  onSelectImage(imageUrl: string) {
    if (this.selectedImage === imageUrl) {
      this.selectedImage = undefined;
    } else {
      this.selectedImage = imageUrl;
    }
  }

  onIncludeClickThroughLinkChange(event: MatCheckboxChange) {
    this.maxChar = event.checked ? this.MAX_SMS_CHAR - this.CLICK_THROUGH_LINK_LENGTH : this.MAX_SMS_CHAR;
  }

  async sendSms() {
    if (!confirm(`Are you sure you want to send the SMS to ${this.customerCount} customers?`)) {
      return;
    }

    this.isSending = true;
    try {
      const res = await this.sendSmsService.sendSms(this.messageContent, this.description, this.includeClickThroughLink, this.selectedImage);
      // await new Promise(x => setTimeout(x, 1000));
      // const res = { success: true };
      // TODO: display error depending on the response
      if (res) {
        this.snackBar.open('Sent SMS successfully', undefined, { duration: 3000 });
      } else {
        alert('You can only send 1 SMS per day');
      }

      // Clear the form to avoid accidentally sending it twice
      // this.messageContent = '';
      // this.selectedImage = undefined;
    } catch (e: any) {
      // TODO: catch error here, eg. send sms too frequent
      alert('Unable to send SMS');
    } finally {
      this.isSending = false;
    }
  }

  onAddImageUrl() {
    console.log('on add image url');
    this.imageUploadInput?.nativeElement.click();
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    if (file.size >= 10_000_000) {
      alert('File size must not exceed 10MB.');
      return;
    }

    // Upload the image
    this.uploadingImage = true;
    try {
      const signedUrlResponse = await this.sendSmsService.getSignedUrl(file.name, file.type);
      const bucketName = signedUrlResponse.url.split('/').pop();
      await this.sendSmsService.uploadToSignedPostUrl(signedUrlResponse.url, signedUrlResponse.fields, file);

      // Update the form
      const imageUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${signedUrlResponse.fields['key']}`;
      this.imageUrls.push(imageUrl);
    } catch (e) {
      console.error('Unable to upload the image', e);
      if (e instanceof HttpErrorResponse) {
        if ((e.error as string).includes('exceeds the maximum allowed size')) {
          alert('File must not exceed 30MB.');
        }
      } else {
        alert('Unable to upload the image. Please try again.');
      }
      return;
    } finally {
      this.uploadingImage = false;
    }
  }

}
