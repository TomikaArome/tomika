import { Component, ElementRef, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { DatatableHeader } from '../model/datatable.model';

@Component({
  selector: 'tmk-datatable-header-container',
  templateUrl: './datatable-header-container.component.html',
  styleUrls: ['./datatable-header-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableHeaderContainerComponent {
  constructor(public elementRef: ElementRef<HTMLElement>) {}

  @HostBinding('class.tmk-datatable-header-container') private className = true;

  @HostBinding('style.--datatable-header-container-x-pos') @Input() xPos = 0;
  @HostBinding('style.--datatable-header-container-y-pos') @Input() yPos = 0;

  @Input() header: DatatableHeader = {
    key: 'undefined',
    label: 'Undefined header'
  };
}
