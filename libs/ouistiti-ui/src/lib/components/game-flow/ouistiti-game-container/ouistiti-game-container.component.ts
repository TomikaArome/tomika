import { Component } from '@angular/core';
import { RoundService } from '../../../services/round.service';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-game-container',
  templateUrl: './ouistiti-game-container.component.html',
  styleUrls: ['./ouistiti-game-container.component.scss']
})
export class OuistitiGameContainerComponent {
  roundStatus$ = this.roundService.roundStatus$;
  selfId$ = this.playerService.selfId$;
  currentLobbyPlayers$ = this.playerService.currentLobbyPlayers$;

  constructor(private roundService: RoundService,
              private playerService: PlayerService) {
  }

  placeBid(bid) {
    this.roundService.placeBid(bid);
  }

  cancelBid() {
    this.roundService.cancelBid();
  }
}
