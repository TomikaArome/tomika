import { Component, ElementRef, Input } from '@angular/core';
import { CardSuit, CardValue } from '@TomikaArome/ouistiti-shared';

interface SymbolPosition {
  x: number;
  y: number;
  large?: true;
  inv?: true;
}

@Component({
  selector: 'tmk-ouistiti-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  cardBackPath = `/assets/ouistiti/images/CARD_BACK.svg`;

  @Input()
  id: string;
  @Input()
  value: CardValue = null;
  @Input()
  suit: CardSuit = null;
  @Input()
  faceUp = true;
  @Input()
  miniature = false;
  @Input()
  set height(height: number) {
    const el = this.elRef.nativeElement as HTMLElement;
    const width = (125 * height) / 175;
    el.style.setProperty('--tmk-ouistiti-card-width', `${width}px`);
    el.style.setProperty('--tmk-ouistiti-card-height', `${height}px`);
  }
  private _dotted = false;
  @Input()
  get dotted(): boolean {
    return this.miniature && !this.isFaceUp && this._dotted;
  }
  set dotted(value: boolean) {
    this._dotted = value;
  }

  get isFaceUp(): boolean {
    return this.faceUp && !!this.value && !!this.suit;
  }

  get symbolPath(): string {
    switch (this.suit) {
      default:
      case CardSuit.SPADE:
        return `M272.5 6.6c-9.3-8.8-23.8-8.8-33.1 0C191.4 52.4 53.6 185 32 208.9c-19.3 21.3-32 49.4-32 80.6C0 360 54.9 415.7 123.5 416c36.7.1 69.7-15.7 92.5-40.9-.1 36.6-.8 52.3-52.4 75.4-14.1 6.3-22.2 21.6-18.7 36.6 3.3 14.5 16.3 24.8
31.2 24.8h159.4c15.5 0 29.2-10.8 32.1-26 2.8-14.6-4.8-29.2-18.4-35.2-51.6-23-52.8-38.1-53-75.6 23.4 25.8 57.5 41.8 95.3 40.8 67.5-1.7 120.7-56.5 120.7-124 0-32.2-12.2-61.2-32-83.1C458.4 185 320.6 52.4 272.5 6.6z`;
      case CardSuit.HEART:
        return `M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z`;
      case CardSuit.CLUB:
        return `M371.5 169.1C403.1 88.4 343.7 0 256 0c-87.8 0-147 88.5-115.5 169.1C65.7 159.2 0 217.3 0 292c0 68.5 55.5 124 124 124 36.5 0 69.3-15.8 92-40.9-.1 36.7-.8 52.4-53 75.6-13.8 6.1-21.4 21.1-18.3 35.9 3.1 14.8 16.2 25.4 31.3
25.4h160c15.1 0 28.2-10.6 31.3-25.4 3.1-14.8-4.5-29.7-18.3-35.9-51.6-23-52.8-38.1-53-75.6 22.7 25.1 55.5 40.9 92 40.9 68.5 0 124-55.5 124-124 0-74.8-65.8-132.8-140.5-122.9z`;
      case CardSuit.DIAMOND:
        return `M242.2 8.3c-9.6-11.1-26.8-11.1-36.4 0l-200 232c-7.8 9-7.8 22.3 0 31.3l200 232c9.6 11.1 26.8 11.1 36.4 0l200-232c7.8-9 7.8-22.3 0-31.3l-200-232z`;
    }
  }

  get svgClasses(): { [key: string]: boolean } {
    const isRed =
      this.suit === CardSuit.HEART || this.suit === CardSuit.DIAMOND;
    return {
      'card-colour-black': !isRed,
      'card-colour-red': isRed,
      dotted: this.dotted,
    };
  }

  get symbolPositions(): SymbolPosition[] {
    const row1 = 35,
      row2 = 52.5,
      row3 = 70,
      row4 = 87.5,
      row5 = 105,
      row6 = 122.5,
      row7 = 140;
    const col1 = 35,
      col2 = 62.5,
      col3 = 90;
    switch (this.value) {
      case CardValue.ACE:
        return [{ x: col2, y: row4, large: true }];
      case CardValue.TWO:
        return [
          { x: col2, y: row1 },
          { x: col2, y: row7, inv: true },
        ];
      case CardValue.THREE:
        return [
          { x: col2, y: row1 },
          { x: col2, y: row7, inv: true },
          { x: col2, y: row4 },
        ];
      case CardValue.FOUR:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
        ];
      case CardValue.FIVE:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col2, y: row4 },
        ];
      case CardValue.SIX:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col1, y: row4 },
          { x: col3, y: row4 },
        ];
      case CardValue.SEVEN:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col1, y: row4 },
          { x: col3, y: row4 },
          { x: col2, y: row3 },
        ];
      case CardValue.EIGHT:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col1, y: row4 },
          { x: col3, y: row4 },
          { x: col2, y: row2 },
          { x: col2, y: row6, inv: true },
        ];
      case CardValue.NINE:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col1, y: row3 },
          { x: col3, y: row3 },
          { x: col1, y: row5, inv: true },
          { x: col3, y: row5, inv: true },
          { x: col2, y: row4 },
        ];
      case CardValue.TEN:
        return [
          { x: col1, y: row1 },
          { x: col3, y: row1 },
          { x: col1, y: row7, inv: true },
          { x: col3, y: row7, inv: true },
          { x: col1, y: row3 },
          { x: col3, y: row3 },
          { x: col1, y: row5, inv: true },
          { x: col3, y: row5, inv: true },
          { x: col2, y: row2 },
          { x: col2, y: row6, inv: true },
        ];
      case CardValue.JACK:
      case CardValue.QUEEN:
      case CardValue.KING:
        return [
          { x: 35, y: 37 },
          { x: 90, y: 138, inv: true },
        ];
    }
    return [];
  }

  get numberValue(): string {
    switch (this.value) {
      case CardValue.TWO:
        return '2';
      case CardValue.THREE:
        return '3';
      case CardValue.FOUR:
        return '4';
      case CardValue.FIVE:
        return '5';
      case CardValue.SIX:
        return '6';
      case CardValue.SEVEN:
        return '7';
      case CardValue.EIGHT:
        return '8';
      case CardValue.NINE:
        return '9';
      case CardValue.TEN:
        return '10';
      case CardValue.JACK:
        return 'J';
      case CardValue.QUEEN:
        return 'Q';
      case CardValue.KING:
        return 'K';
      case CardValue.ACE:
        return 'A';
    }
  }

  get isFaceCard(): boolean {
    return (
      [CardValue.KING, CardValue.QUEEN, CardValue.JACK].indexOf(this.value) > -1
    );
  }

  get faceCardImagePath(): string {
    return `/assets/ouistiti/images/${this.value}_${this.suit}.svg`;
  }

  constructor(private elRef: ElementRef) {}
}
