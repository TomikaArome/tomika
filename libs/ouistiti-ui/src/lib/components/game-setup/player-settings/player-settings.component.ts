import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { PlayerColour, PlayerCreate } from '@TomikaArome/ouistiti-shared';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR, ValidationErrors,
  Validators
} from '@angular/forms';

@Component({
  selector: 'tmk-ouistiti-player-settings',
  templateUrl: './player-settings.component.html',
  styleUrls: ['../../../assets/ouistiti-theme.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => PlayerSettingsComponent),
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PlayerSettingsComponent),
      multi: true
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
    nickname: new FormControl('', [
      Validators.required,
      (control: AbstractControl) => {
        if (this.takenNicknames.indexOf(control.value) > -1) {
          return { 'taken': { takenNicknames: this.takenNicknames } };
        }
        return null;
      }
    ]),
    colour: new FormControl(null),
    symbol: new FormControl(null)
  });
  private formSubscription = this.form.valueChanges.subscribe((value) => {
    this.onChange(value);
    this.onTouch();
  });

  get nicknameControl(): AbstractControl { return this.form.get('nickname'); }

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

  validate(): ValidationErrors | null {
    let invalid = false;
    const errors = Object.keys(this.nicknameControl.errors ?? {}).reduce((renamedErrors, currentKey) => {
      if (currentKey !== 'required' || this.nicknameControl.touched) {
        invalid = true;
        renamedErrors[`nickname${currentKey.charAt(0).toUpperCase()}${currentKey.slice(1)}`] = this.nicknameControl.errors[currentKey];
      }
      return renamedErrors;
    }, {});
    return invalid ? errors : null;
  }

  forceOnChange() {
    this.onTouch();
    this.onChange(this.form.value);
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
