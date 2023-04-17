import { Component, EventEmitter, HostBinding, Input, Output, ViewEncapsulation } from '@angular/core';
import { faCaretDown, faCaretLeft, faCaretRight, faCaretUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tmk-datatable-divider',
  templateUrl: './datatable-divider.component.html',
  styleUrls: ['./datatable-divider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatatableDividerComponent {
  faCaretDown = faCaretDown;
  faCaretLeft = faCaretLeft;
  faCaretRight = faCaretRight;
  faCaretUp = faCaretUp;

  private isHeld = false;

  @HostBinding('class.tmk-datatable-divider') private className = true;

  @HostBinding('style.--datatable-divider-x-pos') @Input() xPos = 0;
  @HostBinding('style.--datatable-divider-y-pos') @Input() yPos = 0;
  @HostBinding('class.horizontal') @Input() isHorizontal = false;
  @HostBinding('class.resizable') @Input() isResizable = false;
  @Input() isHovered = false;
  @HostBinding('class.hovered') get isHoveredOrHeld(): boolean {
    return this.isHovered || this.isHeld;
  }

  @Input() contentBefore: unknown;
  @Input() contentAfter: unknown;

  @Output() hovered = new EventEmitter<boolean>();
  @Output() gripped = new EventEmitter<boolean>();
  @Output() dragged = new EventEmitter<number>();

  get isContentEqual(): boolean {
    return this.contentBefore === this.contentAfter && this.contentBefore !== undefined;
  }

  onHovered(isHovered: boolean) {
    this.hovered.emit(isHovered);
  }
  onGripped(isGripped: boolean) {
    this.gripped.emit(isGripped);
  }
  onDragged(movementX: number) {
    this.dragged.emit(movementX);
  }
}
