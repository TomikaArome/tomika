import { Component, Input } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-player-round-details',
  templateUrl: './player-round-details.component.html',
  styleUrls: ['./player-round-details.component.scss']
})
export class PlayerRoundDetailsComponent {
  @Input()
  player: PlayerInfo;

  get playerColourClass(): { [key: string]: string } {
    const obj = {};
    obj[PlayerService.getColourClassName(this.player.colour)] = true;
    return obj;
  }

  get playerSymbol(): string {
    return PlayerService.getSymbolIconName(this.player.symbol);
  }
}
