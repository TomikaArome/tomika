import { Component, Input } from '@angular/core';
import { GameStatus, LobbyInfo, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { PlayerDatabaseService } from '../../services/player-database.service';

@Component({
  selector: 'tmk-ouistiti-lobby-list-item',
  templateUrl: './lobby-list-item.component.html',
  styleUrls: ['./lobby-list-item.component.scss']
})
export class LobbyListItemComponent {
  @Input()
  lobbyInfo: LobbyInfo;

  constructor(private playerDatabaseService: PlayerDatabaseService) {}

  host(): PlayerInfo {
    return this.lobbyInfo.players.find(player => player.id === this.lobbyInfo.hostId);
  }

  otherPlayerNicknames(): string[] {
    return this.lobbyInfo.players
      .filter(player => this.host() !== player)
      .map(player => player.nickname)
      .sort();
  }

  noOtherPlayers(): boolean {
    return this.otherPlayerNicknames().length === 0;
  }

  isGameInProgress(): boolean {
    return this.lobbyInfo.gameStatus === GameStatus.IN_PROGRESS;
  }

  showNumberOfRounds(): boolean {
    return this.lobbyInfo.gameStatus !== GameStatus.INIT;
  }

  getHostSymbolIconName(): string {
    return this.playerDatabaseService.getSymbolIconName(this.host().symbol);
  }

  getHostColourClassName(): string {
    return this.playerDatabaseService.getColourClassName(this.host().colour);
  }
}
