import {
  Component,
  ContentChild,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { SortableListItemDirective } from './sortable-list-item.directive';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface SortableListRect {
  start: number;
  end: number;
  size: number;
}

interface SortableListTemplateContext<T> {
  $implicit: T;
  dragging: boolean;
  notDragging: boolean;
}

@Component({
  selector: 'tmk-sortable-list',
  templateUrl: './sortable-list.component.html',
  styleUrls: ['./sortable-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SortableListComponent),
    },
  ],
})
export class SortableListComponent<T> implements ControlValueAccessor {
  // Items as set by the input
  @Input()
  get items(): T[] {
    return this.realItems.slice();
  }
  set items(value: T[]) {
    // Remove duplicates
    this.realItems = [...new Set(value)];
  }

  @HostBinding('class.horizontal-list')
  @Input()
  horizontal = false;

  @Input()
  gap = 0;

  private _disabled = false;
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this.disabledChanged.emit(value);
  }

  @Output()
  orderChanged = new EventEmitter<T[]>();
  @Output()
  disabledChanged = new EventEmitter<boolean>();
  @Output()
  draggingStateChanged = new EventEmitter<T>();
  @Output()
  gripped = new EventEmitter<Element>();

  @ContentChild(SortableListItemDirective)
  itemContent: SortableListItemDirective;

  private realItems: T[] = []; // Items as they really exist: while dragging these can be updated externally
  private savedItems: T[] = []; // Items saved while dragging, so that external writes don't change the drag
  itemDragging: T = null;
  private draggingElement: HTMLElement;
  private mouseDownStart = 0;
  private elementStart = 0;
  private elementEnd = 0;
  private lastElementEnd = 0;

  private contexts: SortableListTemplateContext<T>[] = [];

  @HostBinding('class.dragging-in-progress')
  get dragging(): boolean {
    return !!this.itemDragging;
  }
  @HostBinding('class.vertical-list')
  get vertical(): boolean {
    return !this.horizontal;
  }
  @HostBinding('style.gap')
  get gapPx(): string {
    return `${this.gap}px`;
  }

  private get rect(): SortableListRect {
    return this.getRect(this.viewContainerRef.element.nativeElement);
  }
  private get itemRect(): SortableListRect {
    return this.getRect(this.draggingElement);
  }
  private get allRects(): SortableListRect[] {
    const htmlCollection = (
      this.viewContainerRef.element.nativeElement as HTMLElement
    ).children;
    return Array.from(htmlCollection).map((element: HTMLElement) =>
      this.getRect(element)
    );
  }
  private get draggingIndex(): number {
    return this.activeItems.indexOf(this.itemDragging);
  }

  get activeItems(): T[] {
    return this.dragging ? this.savedItems : this.realItems;
  }

  constructor(private viewContainerRef: ViewContainerRef) {}

  onTouch: () => void = () => undefined;
  onChange: (value: T[]) => void = () => undefined;

  private getRect(element: HTMLElement): SortableListRect {
    const rect = element.getBoundingClientRect();
    return {
      start: this.vertical ? rect.top : rect.left,
      end: this.vertical ? rect.bottom : rect.right,
      size: this.vertical ? rect.height : rect.width,
    };
  }

  getTemplateContext(item: T): SortableListTemplateContext<T> {
    return {
      $implicit: item,
      dragging: item === this.itemDragging,
      notDragging: this.dragging && item !== this.itemDragging,
    };
  }

  cancelDrag() {
    document.body.classList.remove('grabbing');
    this.draggingElement.style.setProperty('--drag-difference', '');
    this.itemDragging = null;
    this.draggingStateChanged.emit(null);
    this.gripped.emit(null);
  }

  mouseDown(event: MouseEvent, item: T) {
    const grip = (event.target as HTMLElement).closest('[tmkSortableListGrip]');
    if (!this.disabled && grip) {
      document.body.classList.add('grabbing');
      this.savedItems = this.realItems.slice();
      this.itemDragging = item;
      this.draggingElement = grip.closest('.tmk-sortable-list-item');
      this.mouseDownStart = this.vertical ? event.y : event.x;
      this.elementStart = this.itemRect.start;
      this.elementEnd = this.itemRect.end;
      this.lastElementEnd = this.allRects[this.savedItems.length - 1].end;
      this.draggingStateChanged.emit(this.itemDragging);
      this.gripped.emit(grip);
    }
  }

  @HostListener('window:mousemove', ['$event'])
  private mouseMove(event: MouseEvent) {
    if (this.disabled && this.itemDragging) {
      this.cancelDrag();
    } else if (this.itemDragging) {
      const currentIndex = this.draggingIndex;
      const allRects = this.allRects;
      // Check if moved past element before
      if (currentIndex > 0) {
        if (this.itemRect.start <= allRects[currentIndex - 1].start) {
          this.elementStart = allRects[currentIndex - 1].start;
          this.elementEnd = allRects[currentIndex - 1].end;
          this.mouseDownStart -= allRects[currentIndex - 1].size;
          this.savedItems.splice(currentIndex, 1);
          this.savedItems.splice(currentIndex - 1, 0, this.itemDragging);
        }
      }

      // Check if moved past element after
      if (currentIndex < this.savedItems.length - 1) {
        if (this.itemRect.end >= allRects[currentIndex + 1].end) {
          this.elementStart = allRects[currentIndex + 1].start;
          this.elementEnd = allRects[currentIndex + 1].end;
          this.mouseDownStart += allRects[currentIndex + 1].size;
          this.savedItems.splice(currentIndex, 1);
          this.savedItems.splice(currentIndex + 1, 0, this.itemDragging);
        }
      }

      // Move to cursor
      const minValue = this.rect.start - this.elementStart;
      const maxValue = this.lastElementEnd - this.elementEnd;
      const difference = Math.min(
        Math.max(
          (this.vertical ? event.y : event.x) - this.mouseDownStart,
          minValue
        ),
        maxValue
      );
      this.draggingElement.style.setProperty(
        '--drag-difference',
        `${difference}px`
      );
    }
  }

  @HostListener('window:mouseup', ['$event'])
  private mouseUp() {
    if (this.itemDragging) {
      // Reset state
      this.cancelDrag();

      // Compare new order with real items in case some were added or removed
      const finalItems = this.savedItems.filter(
        (item: T) => this.realItems.indexOf(item) > -1
      );
      this.realItems.forEach((item: T) => {
        if (finalItems.indexOf(item) === -1) {
          finalItems.push(item);
        }
      });
      this.writeValue(finalItems);
    }
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }
  registerOnChange(fn: (value: T[]) => void) {
    this.onChange = fn;
  }
  writeValue(value: T[]) {
    if (value !== null && !this.arraysAreEqual(value)) {
      this.items = value;
      this.onChange(this.items);
      this.onTouch();
      this.orderChanged.emit(this.items);
    }
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  private arraysAreEqual(value: T[]) {
    if (value === this.items) {
      return true;
    }
    if (value.length !== this.items.length) {
      return false;
    }
    return this.items.reduce(
      (acc: boolean, curr: T, index: number) => acc && curr === value[index],
      true
    );
  }
}
