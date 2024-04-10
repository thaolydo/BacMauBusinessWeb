import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SendSmsService } from '@service/send-sms.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-claimed-promotion',
  templateUrl: './claimed-promotion.component.html',
  styleUrl: './claimed-promotion.component.scss'
})
export class ClaimedPromotionComponent implements OnInit {

  id: string | undefined;

  constructor(private sendSmsService: SendSmsService,
    private route: ActivatedRoute,
  ) {
  }

  async ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    this.id = queryParams['id'];
    if (!this.id) {
      alert('Invalid url');
      return;
    }
    await this.sendSmsService.saveClickThroughCount(this.id);
  }
}
