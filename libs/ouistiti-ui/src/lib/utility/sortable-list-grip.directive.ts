import { Directive, ElementRef, OnDestroy } from '@angular/core';
import { SortableListComponent } from './sortable-list.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[tmkSortableListGrip]'
})
export class SortableListGripDirective implements OnDestroy {
  element: HTMLElement = this.elementRef.nativeElement;
  private onDestroy$ = new Subject<void>();

  constructor(private elementRef: ElementRef,
              private sortableList: SortableListComponent<unknown>) {
    this.setCursor(this.sortableList.disabled);
    this.sortableList.disabledChanged
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((disabled: boolean) => this.setCursor(disabled));
  }

  setCursor(disabled: boolean) {
    this.element.style.setProperty('cursor', disabled ? '' : 'grab');
    this.sortableList.gripped
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((element: Element) => {
        if (element === this.element) { this.element.classList.add('tmk-sortable-list-gripped'); }
        else { this.element.classList.remove('tmk-sortable-list-gripped'); }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
