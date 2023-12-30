import { Component, OnInit } from '@angular/core';
import { Role } from '@model/role.model';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {

  Role = Role;

  constructor(protected authService: AuthService) { }

  ngOnInit() {
  }

}
