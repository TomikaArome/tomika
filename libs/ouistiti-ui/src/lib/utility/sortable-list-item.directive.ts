import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tmkSortableListItem]',
})
export class SortableListItemDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
