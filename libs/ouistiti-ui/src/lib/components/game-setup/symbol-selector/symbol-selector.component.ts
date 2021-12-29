import { Component, forwardRef, Input } from '@angular/core';
import { PlayerSymbol } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tmk-ouistiti-symbol-selector',
  templateUrl: './symbol-selector.component.html',
  styleUrls: ['./symbol-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SymbolSelectorComponent),
    }
  ]
})
export class SymbolSelectorComponent implements ControlValueAccessor {
  @Input()
  disabled = false;

  private _chosen: PlayerSymbol = null
  get chosen(): PlayerSymbol {
    return this._chosen;
  }
  set chosen(value: PlayerSymbol) {
    if (!this.disabled && this._chosen !== value) {
      this._chosen = value;
      this.onChange(this._chosen);
      this.onTouch();
    }
  }
  symbols: PlayerSymbol[] = Object.values(PlayerSymbol);

  onChange: (symbol: PlayerSymbol) => void = () => {};
  onTouch: () => void = () => {};

  symbolIconName(symbol: PlayerSymbol): string {
    return PlayerService.getSymbolIconName(symbol);
  }

  symbolClasses(symbol: PlayerSymbol): { [key: string]: boolean } {
    return {
      chosen: this.chosen === symbol,
      disabled: this.disabled
    };
  }

  registerOnChange(fn: (symbol: PlayerSymbol) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(symbol: PlayerSymbol): void {
    this.chosen = symbol;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
