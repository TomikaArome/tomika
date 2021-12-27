import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { ContainerComponent } from './components/container/container.component';
import { ColourSelectorComponent} from './components/lobby-join/colour-selector/colour-selector.component';
import { LandingScreenComponent } from './components/landing-screen/landing-screen.component';
import { LobbyJoinComponent } from './components/lobby-join/lobby-join.component';
import { LobbyListComponent } from './components/lobby-list/lobby-list.component';
import { LobbyListItemComponent } from './components/lobby-list/lobby-list-item.component';
import { SymbolSelectorComponent } from './components/lobby-join/symbol-selector/symbol-selector.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatRippleModule
  ],
  declarations: [
    ContainerComponent,
    ColourSelectorComponent,
    LandingScreenComponent,
    LobbyJoinComponent,
    LobbyListComponent,
    LobbyListItemComponent,
    SymbolSelectorComponent
  ]
})
export class OuistitiUiModule {}
