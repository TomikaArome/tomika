import { NgModule } from '@angular/core';

import { MatSidenavModule } from '@angular/material/sidenav';

import { AdminPanelComponent } from './panel/admin-panel.component';
import { PermissionTreeComponent } from './permission-tree/permission-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    MatSidenavModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  declarations: [
    AdminPanelComponent,
    PermissionTreeComponent
  ]
})
export class AdminPanelModule {}
