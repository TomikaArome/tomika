import { NgModule } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';

import { AdminPanelComponent } from './panel/admin-panel.component';
import { PermissionTreeComponent } from './permission-tree/permission-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [
    MatSidenavModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    CommonModule
  ],
  declarations: [
    AdminPanelComponent,
    PermissionTreeComponent
  ]
})
export class AdminPanelModule {}
