import { Component, Input } from '@angular/core';
import { CardSuit, CardValue, RoundInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']
})
export class CardContainerComponent {
  @Input()
  roundInfo: RoundInfo;

  get cards() {
    // return this.roundInfo.cards ?? [];
    const cards = Object.values(CardSuit).reduce((suitAcc, currSuit) => {
      return [...suitAcc, ...Object.values(CardValue).reduce((valueAcc, currValue) => {
        //if (currValue !== CardValue.JACK && currValue !== CardValue.QUEEN && currValue !== CardValue.KING) { return valueAcc; }
        return [...valueAcc, {
          value: currValue,
          suit: currSuit,
          id: `${currValue}_${currSuit}`
        }];
      }, [])];
    }, []);
    cards.push({ id: 'INVALID' });
    return cards;
  }

}
