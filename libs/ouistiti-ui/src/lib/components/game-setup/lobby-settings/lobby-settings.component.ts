import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  UntypedFormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  LobbyCreateParams,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  MIN_NUMBER_OF_PLAYERS_PER_LOBBY,
} from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-settings',
  templateUrl: './lobby-settings.component.html',
  styleUrls: ['../../../ouistiti-theme.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => LobbySettingsComponent),
    },
  ],
})
export class LobbySettingsComponent implements ControlValueAccessor, OnDestroy {
  @Input()
  disabled = false;

  maxNumberOfPlayersValues = [
    ...Array(
      MAX_NUMBER_OF_PLAYERS_PER_LOBBY - MIN_NUMBER_OF_PLAYERS_PER_LOBBY + 1
    ).keys(),
  ].map((x) => x + MIN_NUMBER_OF_PLAYERS_PER_LOBBY);
  form = new UntypedFormGroup({
    password: new FormControl(''),
    maxNumberOfPlayers: new FormControl(8),
  });
  private formSubscription = this.form.valueChanges.subscribe((value) => {
    this.onChange(value);
    this.onTouch();
  });

  get value(): Partial<LobbyCreateParams> {
    return this.form.value;
  }
  set value(value: Partial<LobbyCreateParams>) {
    let touch = true;
    if (value === null) {
      touch = false;
      value = {
        password: '',
      };
    }
    if (this.form.value !== value) {
      this.form.setValue({
        ...this.form.value,
        ...value,
      });
      this.onChange(this.form.value);
      if (touch) {
        this.onTouch();
      } else {
        this.form.markAsUntouched();
      }
    }
  }

  onChange: (lobbySettings: Partial<LobbyCreateParams>) => void = () =>
    undefined;
  onTouch: () => void = () => undefined;

  registerOnChange(fn: (lobbySettings: Partial<LobbyCreateParams>) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  writeValue(value: Partial<LobbyCreateParams>) {
    this.value = value;
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
