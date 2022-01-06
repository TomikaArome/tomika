import { Directive, ElementRef } from '@angular/core';
import { SortableListComponent } from './sortable-list.component';

@Directive({
  selector: '[tmkSortableListGrip]'
})
export class SortableListGripDirective {
  element: HTMLElement = this.elementRef.nativeElement;

  constructor(private elementRef: ElementRef,
              private sortableList: SortableListComponent<unknown>) {
    this.setCursor(this.sortableList.disabled);
    this.sortableList.disabledChanged.subscribe((disabled: boolean) => this.setCursor(disabled));
  }

  setCursor(disabled: boolean) {
    this.element.style.setProperty('cursor', disabled ? '' : 'grab');
  }
}
