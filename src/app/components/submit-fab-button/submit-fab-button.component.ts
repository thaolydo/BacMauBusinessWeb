import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-submit-fab-button',
  templateUrl: './submit-fab-button.component.html',
  styleUrls: ['./submit-fab-button.component.scss']
})
export class SubmitFabButtonComponent implements OnInit, AfterViewInit {

  @Input('disabled') disabled: boolean | undefined;
  @Input('isSubmitting') isSubmitting: boolean | undefined;
  @Output() onClick = new EventEmitter<string>();

  @ViewChild('button') button: MatButton | undefined;

  spinnerLeft: string = '0px';
  spinnerTop: string = '0px';
  diameter = 30;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const button = this.button?._elementRef.nativeElement as HTMLButtonElement;
    const spinnerLeft = button.clientWidth / 2 - this.diameter / 2;
    this.spinnerLeft = `${spinnerLeft}px`;
    const spinnerTop = button.clientHeight / 2 - this.diameter / 2;
    this.spinnerTop = `${spinnerTop}px`;
  }

  onButtonClick() {
    this.onClick.emit('dummy');
  }

}
