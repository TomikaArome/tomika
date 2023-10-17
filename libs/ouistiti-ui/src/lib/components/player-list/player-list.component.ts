import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  PlayerInfo,
} from '@TomikaArome/ouistiti-shared';
import { PlayerListItemContentDirective } from '../../directives/player-list-item-content.directive';

@Component({
  selector: 'tmk-ouistiti-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
  @Input()
  players: PlayerInfo[] = [];
  _hostId: string;
  @Input()
  get hostId(): string {
    return this._hostId;
  }
  set hostId(value: string) {
    if (this._hostId === this.selfId) {
      this.expandedPlayerId = null;
    }
    this._hostId = value;
  }
  @Input()
  selfId: string;
  @Input()
  maxNumberOfPlayers: number = MAX_NUMBER_OF_PLAYERS_PER_LOBBY;
  @Input()
  sortable = false;

  @Output()
  orderChanged = new EventEmitter<string[]>();

  @ContentChild(PlayerListItemContentDirective)
  playerListItemContent: PlayerListItemContentDirective;

  expandedPlayerId: string = null;

  get isSortable(): boolean {
    return this.sortable && this.players.length > 1;
  }

  isHost(player: PlayerInfo): boolean {
    return this.hostId === player.id;
  }

  isExpandable(player: PlayerInfo): boolean {
    return this.hostId === this.selfId || player.id === this.selfId;
  }

  isExpanded(player: PlayerInfo): boolean {
    return this.expandedPlayerId === player.id;
  }
  setExpandedPlayer(player: PlayerInfo, isExpanded: boolean) {
    this.expandedPlayerId = isExpanded ? player.id : null;
  }

  sortableListOrderChanged(order: PlayerInfo[]) {
    this.orderChanged.emit(order.map((player: PlayerInfo) => player.id));
  }
}
