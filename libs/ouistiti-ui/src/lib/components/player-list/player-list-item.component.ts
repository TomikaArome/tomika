import { Component, Input } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-player-list-item',
  templateUrl: './player-list-item.component.html',
  styleUrls: ['./player-list-item.component.scss']
})
export class PlayerListItemComponent {
  @Input()
  player: PlayerInfo;

  get playerColourClass(): { [key: string]: string } {
    const obj = {};
    obj[PlayerService.getColourClassName(this.player.colour)] = true;
    return obj;
  }
}
