import { Component, Input } from '@angular/core';
import { GameStatus, LobbyInfo, PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'tmk-ouistiti-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.scss']
})
export class LobbyListItemComponent {
  @Input()
  lobbyInfo: LobbyInfo;

  host(): PlayerInfo {
    return this.lobbyInfo.players.find((player: PlayerInfo) => player.id === this.lobbyInfo.hostId);
  }

  otherPlayerNicknames(): string[] {
    return this.lobbyInfo.players
      .filter(player => player.id !== this.lobbyInfo.hostId)
      .map(player => player.nickname)
      .sort();
  }

  noOtherPlayers(): boolean {
    return this.otherPlayerNicknames().length === 0;
  }

  isLobbyJoinable(): boolean {
    return LobbyService.isLobbyJoinable(this.lobbyInfo);
  }

  showNumberOfRounds(): boolean {
    return this.lobbyInfo.gameStatus !== GameStatus.INIT;
  }

  getHostSymbolIconName(): string {
    return PlayerService.getSymbolIconName(this.host().symbol);
  }

  getHostColourClassName(): string {
    return PlayerService.getColourClassName(this.host().colour);
  }
}
