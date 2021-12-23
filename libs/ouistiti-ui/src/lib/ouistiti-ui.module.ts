import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { ContainerComponent } from './components/container.component';
import { LandingScreenComponent } from './components/landing-screen/landing-screen.component';
import { LobbyListComponent } from './components/lobby-list/lobby-list.component';
import { LobbyListItemComponent } from './components/lobby-list/lobby-list-item.component';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatRippleModule
  ],
  declarations: [
    ContainerComponent,
    LandingScreenComponent,
    LobbyListComponent,
    LobbyListItemComponent
  ]
})
export class OuistitiUiModule {}
