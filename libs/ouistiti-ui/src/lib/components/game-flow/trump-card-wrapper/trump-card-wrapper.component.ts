import { Component, Input } from '@angular/core';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { KnownCardInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-trump-card-wrapper',
  templateUrl: './trump-card-wrapper.component.html',
  styleUrls: ['./trump-card-wrapper.component.scss']
})
export class TrumpCardWrapperComponent {
  @Input()
  card: KnownCardInfo = null;
  @Input()
  cardHeight = 175;
  @Input()
  hideNoTrumps = false;

  faBan = faBan;

  get trumpCardBorderContentsStyle() {
    const cardWidth = this.cardHeight / 7 * 5;
    return {
      width: `${cardWidth + 12}px`,
      height: `${this.cardHeight + 12}px`,
      opacity: this.noTrumps ? 1 : 0
    }
  }

  get noTrumps(): boolean {
    return !this.card?.suit || !this.card?.value;
  }
}
