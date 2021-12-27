import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlayerColour } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-colour-selector',
  templateUrl: './colour-selector.component.html',
  styleUrls: ['./colour-selector.component.scss']
})
export class ColourSelectorComponent {
  @Input()
  chosen: PlayerColour = null;
  @Input()
  taken: PlayerColour[] = [];

  @Output()
  selected = new EventEmitter<PlayerColour>();

  colours: PlayerColour[] = Object.values(PlayerColour);

  colourClasses(colour: PlayerColour): any {
    const classes = {
      chosen: this.chosen === colour,
      taken: this.isTaken(colour)
    };
    classes[PlayerService.getColourClassName(colour)] = true;
    return classes;
  }

  clickColour(colour: PlayerColour) {
    if (!this.isTaken(colour)) {
      this.selected.emit(colour);
    }
  }

  private isTaken(colour: PlayerColour): boolean {
    return this.taken.indexOf(colour) > -1;
  }
}
