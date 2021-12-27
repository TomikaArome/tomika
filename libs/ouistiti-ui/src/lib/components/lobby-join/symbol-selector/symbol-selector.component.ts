import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-symbol-selector',
  templateUrl: './symbol-selector.component.html',
  styleUrls: ['./symbol-selector.component.scss']
})
export class SymbolSelectorComponent {
  @Input()
  chosen: PlayerSymbol = null;

  @Output()
  selected = new EventEmitter<PlayerSymbol>();

  symbols: PlayerSymbol[] = Object.values(PlayerSymbol);

  symbolIconName(symbol: PlayerSymbol): string {
    return PlayerService.getSymbolIconName(symbol);
  }

  symbolClasses(symbol: PlayerSymbol): any {
    return {
      chosen: this.chosen === symbol
    };
  }

  clickSymbol(symbol: PlayerSymbol) {
      this.selected.emit(symbol);
  }
}
