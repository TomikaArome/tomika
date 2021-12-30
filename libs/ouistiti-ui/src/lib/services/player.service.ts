import { Injectable } from '@angular/core';
import { PlayerColour, PlayerInfo, PlayerSymbol, SocketStatus } from '@TomikaArome/ouistiti-shared';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CLUB_ICON, DIAMOND_ICON, HEART_ICON, SPADE_ICON } from '../assets/icons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  currentPlayerInLobby$: Observable<boolean> = this.socketService.socketStatus$.pipe(
    map((status: SocketStatus) => status.inLobby)
  );

  currentPlayer$: Observable<PlayerInfo> = this.socketService.socketStatus$.pipe(
    map((status: SocketStatus) => this.getPlayer(status.playerId))
  );

  private players: PlayerInfo[] = [];

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

  getPlayer(playerId: string): PlayerInfo {
    return this.players.find(player => player.id === playerId) ?? null;
  }

  isPlayerSaved(playerId: string): boolean {
    return !!this.getPlayer(playerId);
  }

  savePlayer(playerInfo: PlayerInfo) {
    if (this.isPlayerSaved(playerInfo.id)) {
      const index = this.players.findIndex(player => player.id === playerInfo.id);
      this.players[index] = playerInfo;
    } else {
      this.players.push(playerInfo);
    }
  }
}
