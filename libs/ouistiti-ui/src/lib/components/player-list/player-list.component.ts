import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  selfId: string;
  @Input()
  maxNumberOfPlayers: number = MAX_NUMBER_OF_PLAYERS_PER_LOBBY;
  @Input()
  sortable = false;

  @Output()
  orderChanged = new EventEmitter<string[]>();

  get isSortable(): boolean {
    return this.sortable && this.players.length > 1;
  }

  isHost(player: PlayerInfo): boolean {
    return this.hostId === player.id;
  }

  isExpandable(player: PlayerInfo): boolean {
    return this.hostId === this.selfId || player.id === this.selfId;
  }

  sortableListOrderChanged(order: PlayerInfo[]) {
    this.orderChanged.emit(order.map((player: PlayerInfo) => player.id));
  }
}
