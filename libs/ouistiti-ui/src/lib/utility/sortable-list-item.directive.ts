import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[tmkSortableListItem]',
    standalone: false
})
export class SortableListItemDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
