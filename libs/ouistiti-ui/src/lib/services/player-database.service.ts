import { Injectable } from '@angular/core';
import { PlayerColour, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CLUB_ICON, DIAMOND_ICON, HEART_ICON, SPADE_ICON } from '../assets/icons';

@Injectable({ providedIn: 'root' })
export class PlayerDatabaseService {
  private players: PlayerInfo[];

  constructor(private iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIconLiteral('spade', sanitizer.bypassSecurityTrustHtml(SPADE_ICON));
    this.iconRegistry.addSvgIconLiteral('heart', sanitizer.bypassSecurityTrustHtml(HEART_ICON));
    this.iconRegistry.addSvgIconLiteral('club', sanitizer.bypassSecurityTrustHtml(CLUB_ICON));
    this.iconRegistry.addSvgIconLiteral('diamond', sanitizer.bypassSecurityTrustHtml(DIAMOND_ICON));
  }

  getPlayer(playerId: string): PlayerInfo {
    return this.players.find(player => player.id === playerId);
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

  getSymbolIconName(symbol: PlayerSymbol): string {
    switch (symbol) {
      case PlayerSymbol.SPADE: return 'spade';
      case PlayerSymbol.HEART: return 'heart';
      case PlayerSymbol.CLUB: return 'club';
      case PlayerSymbol.DIAMOND: return 'diamond';
    }
  }

  getColourClassName(colour: PlayerColour): string {
    switch (colour) {
      case PlayerColour.RED: return 'player-colour-red';
      case PlayerColour.ORANGE: return 'player-colour-orange';
      case PlayerColour.YELLOW: return 'player-colour-yellow';
      case PlayerColour.GREEN: return 'player-colour-green';
      case PlayerColour.AQUA: return 'player-colour-aqua';
      case PlayerColour.BLUE: return 'player-colour-blue';
      case PlayerColour.PURPLE: return 'player-colour-purple';
      case PlayerColour.PINK: return 'player-colour-pink';
    }
  }
}
