import { Directive, EventEmitter, HostBinding, HostListener, Input, Output, ViewContainerRef } from "@angular/core";

interface Coordinates {
  x: number;
  y: number;
}

interface Boundaries {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export interface GripDraggedEvent {
  absolute: Coordinates;
  relativeToBoundary?: Coordinates;
  changeSinceLastStep: Coordinates;
  changeSinceGripped: Coordinates;
}
const isHTMLElement = (obj: any): obj is HTMLElement =>
  obj && typeof obj === 'object' && obj.innerText;

@Directive({
  selector: '([tmkGrip])'
})
export class GripDirective {
  private isGripped = false;
  private isHovered = false;
  private elementOriginCoords: Coordinates = { x: 0, y: 0 };
  private elementPrevStepCoords: Coordinates = { x: 0, y: 0 };
  private cursorOriginCoords: Coordinates = { x: 0, y: 0 };
  private element: HTMLElement;
  private grippedTouchIdentifier = -1;

  private get elementRect(): DOMRect {
    return this.element.getBoundingClientRect();
  }

  private isEnabled = true;
  @Input() set tmkGrip(value: boolean | '') {
    if (value === false) {
      this.releaseGrip();
    }
    this.isEnabled = value === '' || value;
  }

  private cursor: string[] = ['grab', 'grabbing'];
  private lastDetectedInputSource = 0;
  /**
   * Sets the cursor when hovering over the element, and gripping it.
   * Any valid value for the CSS cursor property is accepted.
   * Setting a single string value sets the cursor for hover and drag at the same time.
   * Passing either an array of length 2, or a semicolon separated string of values will set the hovered cursor
   * using the first value, and the gripped cursor for the second value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
   */
  @Input() set tmkGripCursor(value: string | string[]) {
    if (typeof value === 'string') {
      value = value.trim().split(/\s*;\s*/);
    }
    this.cursor = value.length === 0
      ? ['unset', 'unset']
      : [value[0] ?? 'grab', value.length === 1 ? value[0] : value[1]];
  }
  @HostBinding('style.cursor') get hoveredCursor(): string {
    if (!this.isEnabled) {
      return 'unset';
    }
    if (this.lastDetectedInputSource !== undefined) {
      return this.tmkGripEventType !== 'touch' && this.lastDetectedInputSource === 1 || this.tmkGripEventType !== 'mouse' && this.lastDetectedInputSource !== 1
        ? this.cursor[0] : 'unset';
    }
    // Fallback for non-Firefox browsers that don't support mozInputSource
    return this.cursor[0];
  }
  get grippedCursor(): string { return this.cursor[1]; }

  private boundaryElement: HTMLElement | null = null;
  private boundaries: Boundaries = {};

  private get boundaryElementRect(): Boundaries | null {
    if (!this.boundaryElement) { return null; }
    const rect = this.boundaryElement?.getBoundingClientRect();
    const computedStyles = this.tmkGripBoundaryBox === 'content-box'
      ? window.getComputedStyle(this.boundaryElement)
      : { borderLeftWidth: '0', borderRightWidth: '0', borderTopWidth: '0', borderBottomWidth: '0' };
    return {
      left: rect.left + parseInt(computedStyles.borderLeftWidth),
      right: rect.right - parseInt(computedStyles.borderRightWidth),
      top: rect.top + parseInt(computedStyles.borderTopWidth),
      bottom: rect.bottom - parseInt(computedStyles.borderBottomWidth)
    };
  }
  private get boundaryLeft(): number { return this.boundaries.left ?? this.boundaryElementRect?.left ?? -1; }
  private get boundaryRight(): number { return this.boundaries.right ?? this.boundaryElementRect?.right ?? -1; }
  private get boundaryTop(): number { return this.boundaries.top ?? this.boundaryElementRect?.top ?? -1; }
  private get boundaryBottom(): number { return this.boundaries.bottom ?? this.boundaryElementRect?.bottom ?? -1; }
  /**
   * Set a boundary outside which the element should never go out of.
   * This value may be any of the following:
   *  - The string "parent" for the boundaries of the parent element
   *  - A CSS query string for the boundaries of the queried element
   *  - A HTMLElement for the boundaries of that element
   *  - An object with any of 4 properties: "left", "right", "top", "bottom"
   * If an element is not found, there will be no boundaries.
   */
  @Input()
  set tmkGripBoundary(value: string | HTMLElement | Boundaries) {
    if (isHTMLElement(value)) {
      this.boundaryElement = value;
      this.boundaries = {};
    } else if (typeof value === 'object') {
      this.boundaryElement = null;
      this.boundaries = value;
    } else if (value === 'parent') {
      this.boundaryElement = this.element.parentElement ?? null;
      this.boundaries = {};
    } else {
      this.boundaryElement = document.querySelector(value);
      this.boundaries = {};
    }
  }

  @Input() tmkGripBoundaryBox: 'content-box' | 'border-box' = 'content-box';
  @Input() tmkGripEventType: 'both' | 'mouse' | 'touch' = 'both';

  @Output() tmkGripHovered = new EventEmitter<boolean>();
  @Output() tmkGripGripped = new EventEmitter<boolean>();
  @Output() tmkGripDragged = new EventEmitter<GripDraggedEvent>();

  constructor(private viewContainer: ViewContainerRef) {
    this.element = this.viewContainer.element.nativeElement;
  }

  @HostListener('mouseenter')
  private onMouseEnter() {
    this.isHovered = true;
    this.tmkGripHovered.emit(this.isHovered);
  }
  @HostListener('mouseleave')
  private onMouseLeave() {
    this.isHovered = false;
    this.tmkGripHovered.emit(this.isHovered);
  }

  @HostListener('mousedown', ['$event'])
  private onMouseDown(event: MouseEvent) {
    if (!this.isGripped && this.tmkGripEventType !== 'touch') {
      event.preventDefault();
      this.grippedTouchIdentifier = -1;
      this.grip(event.clientX, event.clientY);
    }
  }
  @HostListener('window:mousemove', ['$event', '$event.mozInputSource'])
  private onMouseMove(event: MouseEvent, mozInputSource: number) {
    this.lastDetectedInputSource = mozInputSource;
    if (this.isGripped) {
      event.preventDefault();
    }
    this.drag(event.clientX, event.clientY);
  }
  @HostListener('window:mouseup', ['$event'])
  private onMouseUp(event: MouseEvent) {
    if (this.isGripped) {
      event.preventDefault();
    }
    this.releaseGrip();
  }

  @HostListener('touchstart', ['$event'])
  private onTouchStart(event: TouchEvent) {
    if (!this.isGripped && this.tmkGripEventType !== 'mouse') {
      event.preventDefault();
      const touch = event.changedTouches[0];
      this.grippedTouchIdentifier = touch.identifier;
      this.grip(touch.clientX, touch.clientY);
    }
  }
  @HostListener('touchmove', ['$event'])
  private onTouchMove(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.identifier === this.grippedTouchIdentifier) {
        event.preventDefault();
        this.drag(touch.clientX, touch.clientY);
      }
    }
  }
  @HostListener('touchcancel', ['$event'])
  @HostListener('touchend', ['$event'])
  private onTouchEnd(event: TouchEvent) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      if (event.changedTouches[i].identifier === this.grippedTouchIdentifier) {
        event.preventDefault();
        this.releaseGrip();
      }
    }
  }

  private grip(cursorClientX: number, cursorClientY: number) {
    if (this.isEnabled) {
      this.isGripped = true;
      if (this.grippedCursor !== 'unset') {
        document.body.classList.add('tmk-dragging');
        document.body.style.setProperty('--tmk-drag-cursor', this.grippedCursor);
      }
      this.elementOriginCoords.x = this.elementRect.left;
      this.elementOriginCoords.y = this.elementRect.top;
      this.elementPrevStepCoords.x = this.elementRect.left;
      this.elementPrevStepCoords.y = this.elementRect.top;

      this.cursorOriginCoords.x = cursorClientX;
      this.cursorOriginCoords.y = cursorClientY;

      this.cursorOriginCoords = { x: cursorClientX, y: cursorClientY };
      this.tmkGripGripped.emit(this.isGripped);
    }
  }

  private releaseGrip() {
    this.isGripped = false;
    if (this.grippedCursor !== 'unset') {
      document.body.classList.remove('tmk-dragging');
      document.body.style.setProperty('--tmk-drag-cursor', '');
    }
    this.tmkGripGripped.emit(this.isGripped);
  }

  private drag(cursorClientX: number, cursorClientY) {
    if (this.isGripped) {
      const movementSinceGrip: Coordinates = {
        x: cursorClientX - this.cursorOriginCoords.x,
        y: cursorClientY - this.cursorOriginCoords.y
      }
      const elementNewCoords: Coordinates = {
        x: this.elementOriginCoords.x + movementSinceGrip.x,
        y: this.elementOriginCoords.y + movementSinceGrip.y
      }
      if (this.boundaryLeft > -1) { elementNewCoords.x = Math.max(elementNewCoords.x, this.boundaryLeft); }
      if (this.boundaryRight > -1) { elementNewCoords.x = Math.min(elementNewCoords.x, this.boundaryRight - this.elementRect.width); }
      if (this.boundaryTop > -1) { elementNewCoords.y = Math.max(elementNewCoords.y, this.boundaryTop); }
      if (this.boundaryBottom > -1) { elementNewCoords.y = Math.min(elementNewCoords.y, this.boundaryBottom - this.elementRect.height); }
      this.tmkGripDragged.emit({
        absolute: elementNewCoords,
        relativeToBoundary: {
          x: elementNewCoords.x - this.boundaryLeft,
          y: elementNewCoords.y - this.boundaryTop
        },
        changeSinceGripped: {
          x: elementNewCoords.x - this.elementOriginCoords.x,
          y: elementNewCoords .y - this.elementOriginCoords.y
        },
        changeSinceLastStep: {
          x: elementNewCoords.x - this.elementPrevStepCoords.x,
          y: elementNewCoords.y - this.elementPrevStepCoords.y
        }
      });
      this.elementPrevStepCoords.x = elementNewCoords.x;
      this.elementPrevStepCoords.y = elementNewCoords.y;
    }
  }
}
