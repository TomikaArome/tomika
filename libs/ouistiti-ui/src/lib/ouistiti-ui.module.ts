import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { UtilityModule } from './utility/utility.module';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { BidChipComponent } from './components/game-flow/bid-chip/bid-chip.component';
import { BiddingPopupComponent } from './components/game-flow/bidding-popup/bidding-popup.component';
import { CardComponent } from './components/game-flow/card/card.component';
import { CardContainerComponent } from './components/game-flow/card-container/card-container.component';
import { ContainerComponent } from './components/container/container.component';
import { ColourSelectorComponent} from './components/game-setup/colour-selector/colour-selector.component';
import { LandingScreenComponent } from './components/landing-screen/landing-screen.component';
import { LobbyCreateComponent } from './components/lobby-create/lobby-create.component';
import { LobbyJoinComponent } from './components/lobby-join/lobby-join.component';
import { LobbyListComponent } from './components/lobby-list/lobby-list.component';
import { LobbyListItemComponent } from './components/lobby-list/lobby-list-item.component';
import { LobbyScreenComponent } from './components/lobby-screen/lobby-screen.component';
import { LobbySettingsComponent } from './components/game-setup/lobby-settings/lobby-settings.component';
import { OuistitiGameContainerComponent } from './components/game-flow/ouistiti-game-container/ouistiti-game-container.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { PlayerListItemComponent } from './components/player-list/player-list-item.component';
import { PlayerRoundDetailsComponent } from './components/game-flow/player-round-details/player-round-details.component';
import { PlayerSettingsComponent } from './components/game-setup/player-settings/player-settings.component';
import { SymbolSelectorComponent } from './components/game-setup/symbol-selector/symbol-selector.component';
import { TimerComponent } from './components/game-flow/timer/timer.component';
import { TrumpCardWrapperComponent } from './components/game-flow/trump-card-wrapper/trump-card-wrapper.component';

import { PlayerListItemContentDirective } from './directives/player-list-item-content.directive';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    MatIconModule,
    MatRippleModule,
    ReactiveFormsModule,
    UtilityModule
  ],
  declarations: [
    BidChipComponent,
    BiddingPopupComponent,
    CardComponent,
    CardContainerComponent,
    ContainerComponent,
    ColourSelectorComponent,
    LandingScreenComponent,
    LobbyCreateComponent,
    LobbyJoinComponent,
    LobbyListComponent,
    LobbyListItemComponent,
    LobbyScreenComponent,
    LobbySettingsComponent,
    OuistitiGameContainerComponent,
    PlayerListComponent,
    PlayerListItemComponent,
    PlayerRoundDetailsComponent,
    PlayerSettingsComponent,
    SymbolSelectorComponent,
    TimerComponent,
    TrumpCardWrapperComponent,

    PlayerListItemContentDirective
  ]
})
export class OuistitiUiModule {}
