import { Component, Input } from '@angular/core';
import { MAX_NUMBER_OF_PLAYERS_PER_LOBBY, PlayerInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent {
  @Input()
  players: PlayerInfo[] = [];
  @Input()
  hostId: string;
  @Input()
  maxNumberOfPlayers: number = MAX_NUMBER_OF_PLAYERS_PER_LOBBY;
  @Input()
  isSortable = false;

  isHost(player: PlayerInfo): boolean {
    return this.hostId === player.id;
  }
}
