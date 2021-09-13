import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PermissionTreeComponent } from './permission-tree/permission-tree.component';
import { AdminPanelComponent } from './panel/admin-panel.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      {
        path: 'permissions',
        component: PermissionTreeComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPanelRoutingModule {}
