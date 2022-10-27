import { Component, Input } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-player-turn',
  templateUrl: './player-turn.component.html',
  styleUrls: ['./player-turn.component.scss'],
})
export class PlayerTurnComponent {
  @Input()
  currentPlayer: PlayerInfo;
  @Input()
  selfId: string;
}
