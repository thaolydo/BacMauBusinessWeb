import { Component, OnInit } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
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
  isSending: boolean = false;

  constructor(
    private sendSmsService: SendSmsService
  ) { }

  async ngOnInit() {
    this.imageUrls = await this.sendSmsService.getImageUrls();
  }

  async sendSms() {
    this.isSending = true;
    await new Promise(r => setTimeout(r, 2000));
    // await this.sendSmsService.sendSms(this.messageContent, this.selectedImage);
    this.isSending = false;
  }

}
