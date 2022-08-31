import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminPanelModule } from '../admin/admin-panel.module';

import { IndexComponent } from '../index/index.component';
import { ContainerComponent as OuistitiContainerComponent } from '@TomikaArome/ouistiti-ui';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  },
  {
    path: 'admin',
    loadChildren: () => AdminPanelModule
  },
  // TODO - Remove cards test component
  {
    path: 'cards',
    component: OuistitiContainerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
