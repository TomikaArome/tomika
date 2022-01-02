import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  LobbyCreate,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  MIN_NUMBER_OF_PLAYERS_PER_LOBBY
} from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-settings',
  templateUrl: './lobby-settings.component.html',
  styleUrls: ['../../../assets/ouistiti-theme.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => LobbySettingsComponent),
    }
  ]
})
export class LobbySettingsComponent implements ControlValueAccessor, OnDestroy {
  @Input()
  disabled = false;

  maxNumberOfPlayersValues = [...Array(MAX_NUMBER_OF_PLAYERS_PER_LOBBY - MIN_NUMBER_OF_PLAYERS_PER_LOBBY + 1).keys()]
    .map(x => x + MIN_NUMBER_OF_PLAYERS_PER_LOBBY);
  form = new FormGroup({
    password: new FormControl(''),
    maxNumberOfPlayers: new FormControl(8)
  });
  private formSubscription = this.form.valueChanges.subscribe((value) => {
    this.onChange(value);
    this.onTouch();
  });

  get value(): Partial<LobbyCreate> {
    return this.form.value;
  }
  set value(value: Partial<LobbyCreate>) {
    let touch = true;
    if (value === null) {
      touch = false;
      value = {
        password: ''
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

  onChange: (lobbySettings: Partial<LobbyCreate>) => void = () => {};
  onTouch: () => void = () => {};

  registerOnChange(fn: (lobbySettings: Partial<LobbyCreate>) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  writeValue(value: Partial<LobbyCreate>) {
    this.value = value;
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
}
