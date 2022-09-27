import { Component, OnInit } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SendSmsService } from 'src/app/services/send-sms.service';

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.scss']
})
export class SendSmsComponent implements OnInit {

  imageUrls: string[] = [];
  messageContent = '';
  selectedImage: string | undefined = undefined;
  isLoading = false;
  isSending: boolean = false;

  constructor(
    private sendSmsService: SendSmsService,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.imageUrls = await this.sendSmsService.getImageUrls();
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

  async sendSms() {
    this.isSending = true;
    try {
      await new Promise(r => setTimeout(r, 2000));
      // await this.sendSmsService.sendSms(this.messageContent, this.selectedImage);
      this.snackBar.open('Send SMS successful', undefined, { duration: 3000 });

      // Clear the form to avoid accidentally sending it twice
      this.messageContent = '';
      this.selectedImage = undefined;
    } finally {
      // TODO: catch error here, eg. send sms too frequent
      this.isSending = false;
    }
  }

}
