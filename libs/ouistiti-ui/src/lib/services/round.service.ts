import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { merge, Observable } from 'rxjs';
import { BidInfo, BidParams, BidsChanged, CardInfo, CardPlayed, RoundInfo, RoundStatus, RoundStatusChanged, WonCardInfo } from '@TomikaArome/ouistiti-shared';
import { map, scan } from 'rxjs/operators';

type RoundStatusTemporaryObservableValue = {
  event: 'roundStatus';
  payload: RoundInfo
} | {
  event: 'bidsChanged',
  payload: BidsChanged
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
    this.socketService.getEvent<BidsChanged>('bidsChanged').pipe(map((v: BidsChanged) => { return { event: 'bidsChanged', payload: v }; })),
    this.socketService.getEvent<CardPlayed>('cardPlayed').pipe(map((v: CardPlayed) => { return { event: 'cardPlayed', payload: v }; })),
    this.socketService.getEvent<WonCardInfo[]>('trickWon').pipe(map((v: WonCardInfo[]) => { return { event: 'trickWon', payload: v }; })),
    this.socketService.getEvent<RoundStatusChanged>('roundStatusChanged').pipe(map((v: RoundStatusChanged) => { return { event: 'roundStatusChanged', payload: v }; }))
  ).pipe(
    scan((currStatus: RoundInfo, v: RoundStatusTemporaryObservableValue) => {
      // console.log(v);
      if (v.event === 'roundStatus') {
        currStatus = v.payload;
      } else if (v.event === 'bidsChanged') {
        currStatus.bids = v.payload.bids;
        currStatus.breakPoint = v.payload.breakPoint;
      } else if (v.event === 'cardPlayed') {
        currStatus.currentPlayerId = v.payload.nextPlayerId;
        RoundService.updateCardInfo(currStatus.cards, v.payload.card);
      } else if (v.event === 'trickWon') {
        v.payload.forEach((cardInfo: WonCardInfo) => RoundService.updateCardInfo(currStatus.cards, cardInfo));
      } else if (v.event === 'roundStatusChanged') {
        currStatus.status = v.payload.status;
        if (v.payload.status === RoundStatus.PLAY) {
          currStatus.bids = v.payload.bids;
          currStatus.breakPoint = v.payload.breakPoint;
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

  placeBid(bid: number) {
    const params: BidParams = { bid };
    this.socketService.emitEvent('placeBid', params);
  }

  cancelBid() {
    this.socketService.emitEvent('cancelBid');
  }
}
