import { Injectable } from '@angular/core';
import {
  LobbyStatus,
  PlayerColour,
  PlayerInfo,
  PlayerSymbol,
  PlayerUpdateParams,
} from '@TomikaArome/ouistiti-shared';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  CLUB_ICON,
  DIAMOND_ICON,
  HEART_ICON,
  SPADE_ICON,
} from '../assets/icons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  selfInLobby$: Observable<boolean> = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(map((status: LobbyStatus) => status.inLobby));
  selfId$: Observable<string> = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(map((status: LobbyStatus) => status?.playerId ?? null));
  isHost$ = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(
      map(
        (status: LobbyStatus) =>
          !!status.inLobby && status.playerId === status.lobby.hostId
      )
    );
  currentLobbyPlayers$: Observable<PlayerInfo[]> = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(map((status: LobbyStatus) => status?.lobby?.players ?? []));

  static getSymbolIconName(symbol: PlayerSymbol): string {
    return symbol.toLowerCase();
  }

  static getColourClassName(colour: PlayerColour): string {
    return `player-colour-${colour.toLowerCase()}`;
  }

  constructor(
    private socketService: SocketService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  registerIcons() {
    this.iconRegistry.addSvgIconLiteral(
      'spade',
      this.sanitizer.bypassSecurityTrustHtml(SPADE_ICON)
    );
    this.iconRegistry.addSvgIconLiteral(
      'heart',
      this.sanitizer.bypassSecurityTrustHtml(HEART_ICON)
    );
    this.iconRegistry.addSvgIconLiteral(
      'club',
      this.sanitizer.bypassSecurityTrustHtml(CLUB_ICON)
    );
    this.iconRegistry.addSvgIconLiteral(
      'diamond',
      this.sanitizer.bypassSecurityTrustHtml(DIAMOND_ICON)
    );
  }

  updatePlayerSettings(params: PlayerUpdateParams) {
    this.socketService.emitEvent('updatePlayer', params);
  }
}
