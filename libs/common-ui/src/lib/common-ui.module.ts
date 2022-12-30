import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DatatableCellContainerComponent } from './datatable/cell-container/datatable-cell-container.component';
import { DatatableComponent } from './datatable/datatable.component';
import { DatatableDividerComponent } from './datatable/divider/datatable-divider.component';
import { DatatableHeaderContainerComponent } from './datatable/header-container/datatable-header-container.component';
import { GripDirective } from "./directives/grip.directive";

@NgModule({
  imports: [CommonModule, FontAwesomeModule],
  exports: [
    DatatableComponent,
    GripDirective
  ],
  declarations: [
    DatatableCellContainerComponent,
    DatatableComponent,
    DatatableDividerComponent,
    DatatableHeaderContainerComponent,
    GripDirective
  ]
})
export class CommonUiModule {}
