import { Component, ElementRef, Input } from '@angular/core';
import { BidInfo, isKnownBidInfo, PlayerInfo, WonCardInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-player-round-details',
  templateUrl: './player-round-details.component.html',
  styleUrls: ['./player-round-details.component.scss']
})
export class PlayerRoundDetailsComponent {
  @Input()
  player: PlayerInfo;
  @Input()
  bid: BidInfo;
  @Input()
  wonCards: WonCardInfo[] = [];
  @Input()
  set angle(angle: number) {
    let borderRadius = '50px 20px 50px 50px';
    if (angle === 180) { borderRadius = '0 50px 0 0'; }
    else if (angle === -90) { borderRadius = '0 50px 50px 0'; }
    else if (angle === 0) { borderRadius = '0 0 50px 50px'; }
    else if (angle === 90) { borderRadius = '50px 0 0 50px'; }
    else if (angle < 0) { borderRadius = '20px 50px 50px 50px'; }
    (this.elRef.nativeElement as HTMLElement).style.setProperty('--tmk-ouistiti-player-round-details-border-radius', borderRadius);
  }
  @Input()
  bidsStillPending = false;

  get bidChips(): boolean[] {
    if (isKnownBidInfo(this.bid)) {
      return Array.from(Array(this.bid.bid).map(() => false));
    }
    return [true];
  }

  get miniatureCards(): boolean[] {
    let miniatureCards = this.wonCards.reduce((tricksArr: number[], wonCard: WonCardInfo) => {
      if (tricksArr.indexOf(wonCard.playedOnTurn) === -1) {
        tricksArr.push(wonCard.playedOnTurn);
      }
      return tricksArr;
    }, []).map(() => false);
    if (isKnownBidInfo(this.bid)) {
      miniatureCards = [
        ...miniatureCards,
        ...Array.from(Array(Math.max(this.bid.bid - miniatureCards.length, 0))).map(() => true)
      ];
    }
    return miniatureCards;
  }

  constructor(private elRef: ElementRef) {}
}
