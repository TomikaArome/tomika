import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { ContainerComponent } from './components/container/container.component';
import { ColourSelectorComponent} from './components/game-setup/colour-selector/colour-selector.component';
import { LandingScreenComponent } from './components/landing-screen/landing-screen.component';
import { LobbyCreateComponent } from './components/lobby-create/lobby-create.component';
import { LobbyJoinComponent } from './components/lobby-join/lobby-join.component';
import { LobbyListComponent } from './components/lobby-list/lobby-list.component';
import { LobbyListItemComponent } from './components/lobby-list/lobby-list-item.component';
import { LobbySettingsComponent } from './components/game-setup/lobby-settings/lobby-settings.component';
import { PlayerSettingsComponent } from './components/game-setup/player-settings/player-settings.component';
import { SymbolSelectorComponent } from './components/game-setup/symbol-selector/symbol-selector.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatRippleModule,
    ReactiveFormsModule
  ],
  declarations: [
    ContainerComponent,
    ColourSelectorComponent,
    LandingScreenComponent,
    LobbyCreateComponent,
    LobbyJoinComponent,
    LobbyListComponent,
    LobbyListItemComponent,
    LobbySettingsComponent,
    PlayerSettingsComponent,
    SymbolSelectorComponent
  ]
})
export class OuistitiUiModule {}
