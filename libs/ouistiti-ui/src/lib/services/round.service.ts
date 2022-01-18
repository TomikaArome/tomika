import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { merge, Observable } from 'rxjs';
import { BidInfo, CardInfo, CardPlayed, KnownBidInfo, RoundInfo, RoundStatus, RoundStatusChanged, WonCardInfo } from '@TomikaArome/ouistiti-shared';
import { map, scan } from 'rxjs/operators';

type RoundStatusTemporaryObservableValue = {
  event: 'roundStatus';
  payload: RoundInfo
} | {
  event: 'bid',
  payload: BidInfo
} | {
  event: 'cardPlayed',
  payload: CardPlayed
} | {
  event: 'trickWon',
  payload: WonCardInfo[]
} | {
  event: 'roundStatusChanged';
  payload: RoundStatusChanged
}

@Injectable({ providedIn: 'root' })
export class RoundService {
  roundStatus$: Observable<RoundInfo> = merge(
    this.socketService.getEvent<RoundInfo>('roundStatus').pipe(map((v: RoundInfo) => { return { event: 'roundStatus', payload: v }; })),
    this.socketService.getEvent<BidInfo>('bid').pipe(map((v: BidInfo) => { return { event: 'bid', payload: v }; })),
    this.socketService.getEvent<CardPlayed>('cardPlayed').pipe(map((v: CardPlayed) => { return { event: 'cardPlayed', payload: v }; })),
    this.socketService.getEvent<WonCardInfo[]>('trickWon').pipe(map((v: WonCardInfo[]) => { return { event: 'trickWon', payload: v }; })),
    this.socketService.getEvent<RoundStatusChanged>('roundStatusChanged').pipe(map((v: RoundStatusChanged) => { return { event: 'roundStatusChanged', payload: v }; }))
  ).pipe(
    scan((currStatus: RoundInfo, v: RoundStatusTemporaryObservableValue) => {
      if (v.event === 'roundStatus') {
        currStatus = v.payload;
      } else if (v.event === 'bid') {
        RoundService.updateBidInfo(currStatus.bids, v.payload);
      } else if (v.event === 'cardPlayed') {
        currStatus.currentPlayerId = v.payload.nextPlayerId;
        RoundService.updateCardInfo(currStatus.cards, v.payload.card);
      } else if (v.event === 'trickWon') {
        v.payload.forEach((cardInfo: WonCardInfo) => RoundService.updateCardInfo(currStatus.cards, cardInfo));
      } else if (v.event === 'roundStatusChanged') {
        currStatus.status = v.payload.status;
        if (v.payload.status === RoundStatus.PLAY) {
          v.payload.finalBids.forEach((bid: KnownBidInfo) => RoundService.updateBidInfo(currStatus.bids, bid));
        }
      }
      return currStatus;
    }, SocketService.roundStatusInitialValue)
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
