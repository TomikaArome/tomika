import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortableListComponent } from './sortable-list.component';
import { SortableListItemDirective } from './sortable-list-item.directive';
import { SortableListGripDirective } from './sortable-list-grip.directive';

/* Module of components that should maybe be moved to a larger shared library at
   some point (not Ouistiti specific) */

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SortableListComponent,
    SortableListItemDirective,
    SortableListGripDirective
  ],
  exports: [
    SortableListComponent,
    SortableListItemDirective,
    SortableListGripDirective
  ]
})
export class UtilityModule {}
