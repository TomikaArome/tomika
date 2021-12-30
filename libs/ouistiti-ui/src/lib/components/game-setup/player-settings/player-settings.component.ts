import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { PlayerColour, PlayerCreate } from '@TomikaArome/ouistiti-shared';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tmk-ouistiti-player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['../../../assets/ouistiti-theme.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PlayerSettingsComponent),
    }
  ]
})
export class PlayerSettingsComponent implements ControlValueAccessor, OnDestroy {
  @Input()
  takenNicknames: string[] = [];
  @Input()
  takenColours: PlayerColour[] = [];
  @Input()
  disabled = false;

  form = new FormGroup({
    nickname: new FormControl('fasdf'),
    colour: new FormControl(null),
    symbol: new FormControl(null)
  });
  private formSubscription = this.form.valueChanges.subscribe((value) => {
    this.onChange(value);
    this.onTouch();
  });

  get value(): Partial<PlayerCreate> {
    return this.form.value;
  }
  set value(value: Partial<PlayerCreate>) {
    let touch = true;
    if (value === null) {
      touch = false;
      value = {
        nickname: '',
        colour: null,
        symbol: null
      };
    }
    if (this.form.value !== value) {
      this.form.setValue({
        ...this.form.value,
        ...value
      });
      this.onChange(this.form.value);
      if (touch) {
        this.onTouch();
      } else {
        this.form.markAsUntouched();
      }
    }
  }

  onChange: (playerSettings: Partial<PlayerCreate>) => void = () => {};
  onTouch: () => void = () => {};

  registerOnChange(fn: (playerSettings: Partial<PlayerCreate>) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: Partial<PlayerCreate>): void {
    this.value = value;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
