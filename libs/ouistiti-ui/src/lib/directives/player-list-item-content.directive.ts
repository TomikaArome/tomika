import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tmkOuistitiPlayerListItemContent]',
})
export class PlayerListItemContentDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
