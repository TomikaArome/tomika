import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tmk-datatable-cell-container',
  templateUrl: './datatable-cell-container.component.html',
  styleUrls: ['./datatable-cell-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableCellContainerComponent {
  @HostBinding('class.tmk-datatable-cell-container') private className = true;

  @HostBinding('style.--datatable-cell-container-x-pos') @Input() xPos = 0;
  @HostBinding('style.--datatable-cell-container-y-pos') @Input() yPos = 0;
}
