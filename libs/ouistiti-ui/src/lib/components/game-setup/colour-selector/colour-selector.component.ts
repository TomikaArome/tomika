import { Component, forwardRef, Input } from '@angular/core';
import { PlayerColour } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tmk-ouistiti-colour-selector',
  templateUrl: './colour-selector.component.html',
  styleUrls: ['./colour-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => ColourSelectorComponent),
    }
  ]
})
export class ColourSelectorComponent implements ControlValueAccessor {
  @Input()
  taken: PlayerColour[] = [];
  @Input()
  disabled = false;

  private _chosen: PlayerColour = null;
  get chosen(): PlayerColour {
    return this._chosen;
  }
  set chosen(value: PlayerColour) {
    if (!this.disabled && this._chosen !== value && !this.isTaken(value)) {
      this._chosen = value;
      this.onChange(this._chosen);
      this.onTouch();
    }
  }
  colours: PlayerColour[] = Object.values(PlayerColour);

  onChange: (colour: PlayerColour) => void = () => {};
  onTouch: () => void = () => {};

  colourClasses(colour: PlayerColour): { [key: string]: boolean } {
    const classes = {
      chosen: this.chosen === colour,
      taken: this.disabled || this.isTaken(colour)
    };
    classes[PlayerService.getColourClassName(colour)] = true;
    return classes;
  }

  private isTaken(colour: PlayerColour): boolean {
    return this.taken.indexOf(colour) > -1;
  }

  registerOnChange(fn: (colour: PlayerColour) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  writeValue(colour: PlayerColour) {
    this.chosen = colour;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
