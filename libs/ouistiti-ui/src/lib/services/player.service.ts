import { Injectable } from '@angular/core';
import { LobbyStatus, PlayerColour, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CLUB_ICON, DIAMOND_ICON, HEART_ICON, SPADE_ICON } from '../assets/icons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  currentPlayerInLobby$: Observable<boolean> = this.socketService.lobbyStatus$.pipe(
    map((status: LobbyStatus) => status.inLobby)
  );
  currentPlayer$: Observable<PlayerInfo> = this.socketService.lobbyStatus$.pipe(
    map((status: LobbyStatus) => status.lobby.players.find((player: PlayerInfo) => player.id === status.playerId) ?? null)
  );
  isHost$ = this.socketService.lobbyStatus$.pipe(
    map((status: LobbyStatus) => status.playerId === status.lobby.hostId)
  );

  static getSymbolIconName(symbol: PlayerSymbol): string {
    return symbol.toLowerCase();
  }

  static getColourClassName(colour: PlayerColour): string {
    return `player-colour-${colour.toLowerCase()}`;
  }

  constructor(private socketService: SocketService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    this.registerIcons();
  }

  registerIcons() {
    this.iconRegistry.addSvgIconLiteral('spade', this.sanitizer.bypassSecurityTrustHtml(SPADE_ICON));
    this.iconRegistry.addSvgIconLiteral('heart', this.sanitizer.bypassSecurityTrustHtml(HEART_ICON));
    this.iconRegistry.addSvgIconLiteral('club', this.sanitizer.bypassSecurityTrustHtml(CLUB_ICON));
    this.iconRegistry.addSvgIconLiteral('diamond', this.sanitizer.bypassSecurityTrustHtml(DIAMOND_ICON));
  }
}
