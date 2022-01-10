import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { merge, Observable } from 'rxjs';
import { BidInfo, CardInfo, PlayedCardInfo, RoundInfo, WonCardInfo } from '@TomikaArome/ouistiti-shared';
import { map, scan } from 'rxjs/operators';

type RoundStatusTemporaryObservableValue = {
  event: 'roundStatus';
  payload: RoundInfo
} | {
  event: 'bid',
  payload: BidInfo
} | {
  event: 'cardPlayed',
  payload: PlayedCardInfo
} | {
  event: 'trickWon',
  payload: WonCardInfo[]
}

@Injectable({ providedIn: 'root' })
export class RoundService {
  roundStatus$: Observable<RoundInfo> = merge(
    this.socketService.roundStatus$.pipe(map(v => { return { event: 'roundStatus', payload: v }; })),
    this.socketService.bid$.pipe(map(v => { return { event: 'bid', payload: v }; })),
    this.socketService.cardPlayed$.pipe(map(v => { return { event: 'cardPlayed', payload: v }; })),
    this.socketService.trickWon$.pipe(map(v => { return { event: 'trickWon', payload: v }; }))
  ).pipe(
    scan((currStatus: RoundInfo, v: RoundStatusTemporaryObservableValue) => {
      if (v.event === 'roundStatus') {
        currStatus = v.payload;
      } else if (v.event === 'bid') {
        RoundService.updateBidInfo(currStatus.bids, v.payload);
      } else if (v.event === 'cardPlayed') {
        RoundService.updateCardInfo(currStatus.cards, v.payload);
      } else if (v.event === 'trickWon') {
        v.payload.forEach((cardInfo: WonCardInfo) => RoundService.updateCardInfo(currStatus.cards, cardInfo));
      }
      return currStatus;
    }, {
      currentPlayerId: null,
      cards: [],
      bids: []
    })
  );

  private static updateBidInfo(bids: BidInfo[], newBid: BidInfo) {
    const originalBidIndex = bids.findIndex((bid: BidInfo) => bid.playerId === newBid.playerId);
    if (originalBidIndex === -1) {
      bids.push(newBid);
    } else {
      bids[originalBidIndex] = newBid;
    }
  }

  private static updateCardInfo(cards: CardInfo[], newCard: CardInfo) {
    const originalCardIndex = cards.findIndex((card: CardInfo) => card.id === newCard.id);
    if (originalCardIndex === -1) {
      cards.push(newCard);
    } else {
      cards[originalCardIndex] = newCard;
    }
  }

  constructor(private socketService: SocketService) {}
}
