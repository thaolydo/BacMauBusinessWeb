import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.scss']
})
export class SubmitButtonComponent implements OnInit, AfterViewInit {

  @Input('disabled') disabled: boolean | undefined;
  @Input('isSubmitting') isSubmitting: boolean | undefined;
  @Input('buttonColor') buttonColor: string = 'primary';
  @Input('buttonType') buttonType: string = 'raised';
  @Input('diameter') diameter: number = 30;
  @Output() onClick = new EventEmitter<string>();

  @ViewChild('button') button: MatButton | undefined;

  spinnerLeft: string = '0px';
  spinnerTop: string = '0px';

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    // this.isSubmitting = true;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const button = this.button?._elementRef.nativeElement as HTMLButtonElement;
      const parent = button.children.item(1) as HTMLElement;
      // const spinnerLeft = button.clientWidth / 2 - this.diameter / 2;
      // this.spinnerLeft = `${spinnerLeft}px`;
      // const spinnerTop = button.clientHeight / 2 - this.diameter / 2;
      // this.spinnerTop = `${spinnerTop}px`;
      const spinnerLeft = button.clientWidth / 2 - this.diameter / 2- parent.offsetLeft;
      this.spinnerLeft = `${spinnerLeft}px`;
      const spinnerTop = button.clientHeight / 2 - this.diameter / 2 - parent.offsetTop;
      this.spinnerTop = `${spinnerTop}px`;
    });
  }

  onButtonClick() {
    this.onClick.emit('dummy');
  }

}
