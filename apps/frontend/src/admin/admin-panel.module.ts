import { NgModule } from '@angular/core';

import { AdminPanelRoutingModule } from './admin-panel-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';

import { AdminPanelComponent } from './panel/admin-panel.component';
import { PermissionTreeComponent } from './permission-tree/permission-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    AdminPanelRoutingModule,
    CommonModule,
    MatSidenavModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatRippleModule,
  ],
  declarations: [AdminPanelComponent, PermissionTreeComponent],
})
export class AdminPanelModule {}
