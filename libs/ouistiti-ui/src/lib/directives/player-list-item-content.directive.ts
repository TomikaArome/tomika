import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[tmkOuistitiPlayerListItemContent]',
    standalone: false
})
export class PlayerListItemContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
