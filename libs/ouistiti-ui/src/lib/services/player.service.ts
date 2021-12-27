import { Injectable } from '@angular/core';
import { PlayerColour, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CLUB_ICON, DIAMOND_ICON, HEART_ICON, SPADE_ICON } from '../assets/icons';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private players: PlayerInfo[] = [];

  static getSymbolIconName(symbol: PlayerSymbol): string {
    return symbol.toLowerCase();
  }

  static getColourClassName(colour: PlayerColour): string {
    return `player-colour-${colour.toLowerCase()}`;
  }

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIconLiteral('spade', sanitizer.bypassSecurityTrustHtml(SPADE_ICON));
    this.iconRegistry.addSvgIconLiteral('heart', sanitizer.bypassSecurityTrustHtml(HEART_ICON));
    this.iconRegistry.addSvgIconLiteral('club', sanitizer.bypassSecurityTrustHtml(CLUB_ICON));
    this.iconRegistry.addSvgIconLiteral('diamond', sanitizer.bypassSecurityTrustHtml(DIAMOND_ICON));
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
