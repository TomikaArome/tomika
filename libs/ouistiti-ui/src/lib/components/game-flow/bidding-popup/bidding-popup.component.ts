import { Component, EventEmitter, Input, Output } from '@angular/core';
import { KnownBidInfo, OwnedAndKnownCardInfo, PlayerColour, PlayerInfo, PlayerSymbol, RoundInfo, TrumpCardInfo, UnknownBidInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-bidding-popup',
  templateUrl: './bidding-popup.component.html',
  styleUrls: ['./bidding-popup.component.scss']
})
export class BiddingPopupComponent {
  @Input()
  roundInfo: RoundInfo;
  @Input()
  players: PlayerInfo[];
  @Input()
  selfId: string;
  @Input()
  biddingEndsTimestamp = 150000;
  @Input()
  proceedingToPlayTimestamp = 5000;

  @Output()
  bidPlaced = new EventEmitter<number>();
  @Output()
  bidCancelled = new EventEmitter<void>();

  get maxBid(): number {
    return this.roundInfo.cards.filter((card: OwnedAndKnownCardInfo) => card.ownerId === this.selfId).length;
  }

  get bidArray(): number[] {
    return Array.from(Array(this.maxBid + 1)).map((_, index) => index);
  }

  get self(): PlayerInfo {
    return this.players.find((player: PlayerInfo) => player.colour) ?? null;
  }

  get bidStackClass(): { [key: string]: boolean } {
    const obj = {
      'bid-selected': this.selfBid !== null
    };
    obj[PlayerService.getColourClassName(this.self?.colour)] = true;
    return obj;
  }

  get trumpCard(): TrumpCardInfo {
    return this.roundInfo.cards.find((c: TrumpCardInfo) => c.isTrumpCard) as TrumpCardInfo;
  }

  get startingPlayer(): PlayerInfo {
    return this.players.find((p: PlayerInfo) => p.id === this.roundInfo.currentPlayerId);
  }
  get startingPlayerColour(): PlayerColour { return this.startingPlayer?.colour; }
  get startingPlayerSymbol(): PlayerSymbol { return this.startingPlayer?.symbol; }

  get startingPlayerNickname(): string {
    return this.startingPlayer?.id === this.selfId ? 'You' : this.startingPlayer?.nickname;
  }
  get startingPlayerTense(): string {
    return this.startingPlayer?.id === this.selfId ? 'are' : 'is';
  }

  get selfBid(): number {
    return (this.roundInfo.bids.find((bid: KnownBidInfo) => bid.playerId === this.selfId) as KnownBidInfo)?.bid ?? null;
  }

  waitingForPlayer(playerId: string): boolean {
    const bid = this.roundInfo.bids.find((bid: UnknownBidInfo) => bid.playerId === playerId) as UnknownBidInfo;
    return bid?.bidPending;
  }

  selectBid(bid: number) {
    if (this.selfBid === null) {
      this.bidPlaced.emit(bid);
    }
  }

  cancelBid() {
    this.bidCancelled.emit();
  }
}
