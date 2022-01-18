import { Card } from './card.class';
import { OuistitiException } from './ouistiti-exception.class';
import { BidInfo, isKnownBidInfo, KnownBidInfo, OuistitiErrorType, OuistitiInvalidActionReason, RoundInfo, RoundStatus, RoundStatusChanged } from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CardPlayedObserved } from '../interfaces/round-observed.interface';

export enum RoundStage {
  ASC, NO_TRUMPS, DESC
}

export interface RoundSettings {
  roundNumber: number;
  playerIds: string[];
  maxCardsPerPlayer: number;
}

export class Round {
  roundNumber: number;
  stage: RoundStage;
  status: RoundStatus = RoundStatus.BIDDING;
  cards: Card[] = [];
  trumpCard: Card;
  numberOfCardsPerPlayer: number;
  currentPlayerId: string;
  currentTurnNumber = 1;
  bids: BidInfo[] = [];

  readonly playerIds: string[];
  readonly maxCardsPerPlayer: number;

  private statusChangedSource = new Subject<RoundStatusChanged>();
  private bidPlacedSource = new Subject<KnownBidInfo>();
  private bidCancelledSource = new Subject<string>();
  private cardPlayedSource = new Subject<CardPlayedObserved>();
  private turnFinishedSource = new Subject<Card>();

  statusChanged$ = this.statusChangedSource.asObservable();
  bidsFinalised$ = this.statusChanged$.pipe(filter((p: RoundStatusChanged) => p.status === RoundStatus.PLAY));
  completed$ = this.statusChanged$.pipe(filter((p: RoundStatusChanged) => p.status === RoundStatus.COMPLETED));
  bidPlaced$ = this.bidPlacedSource.asObservable().pipe(takeUntil(this.bidsFinalised$));
  bidCancelled$ = this.bidCancelledSource.asObservable().pipe(takeUntil(this.bidsFinalised$));
  cardPlayed$ = this.cardPlayedSource.asObservable().pipe(takeUntil(this.completed$));
  turnFinished$ = this.turnFinishedSource.asObservable().pipe(takeUntil(this.completed$));

  get isLastTurn(): boolean {
    return this.currentTurnNumber === this.playerIds.length;
  }

  get isLastRound(): boolean {
    return this.numberOfCardsPerPlayer === 1 && this.stage === RoundStage.DESC;
  }

  get startingPlayerId(): string {
    return this.playerIds[(this.roundNumber - 1) % this.playerIds.length];
  }

  get info(): RoundInfo {
    return {
      currentPlayerId: this.currentPlayerId,
      currentTurnNumber: this.currentTurnNumber,
      playerOrder: this.playerIds,
      status: this.status,
      cards: this.cards.map((card: Card) => {
        if (card === this.trumpCard) { return { ...card.info, isTrumpCard: true }; }
        return card.info;
      }),
      bids: this.bids
    }
  }

  static createNewRound(settings: RoundSettings): Round {
    const round = new Round(settings);
    round.initRound();
    round.initBids();
    round.generateCards();
    return round;
  }

  constructor(settings: RoundSettings) {
    this.roundNumber = settings.roundNumber;
    this.playerIds = settings.playerIds;
    this.maxCardsPerPlayer = settings.maxCardsPerPlayer;
  }

  infoKnownToPlayer(playerId: string): RoundInfo {
    return {
      ...this.info,
      cards: this.cards.map((card: Card) => {
        if (card === this.trumpCard) { return { ...card.info, isTrumpCard: true }; }
        if (card.ownerId !== playerId && !card.played) { return card.incompleteInfo; }
        return card.info;
      }),
      bids: this.bids.map((bidInfo: BidInfo) => {
        if (this.status === RoundStatus.BIDDING && bidInfo.playerId !== playerId) {
          return { playerId: bidInfo.playerId, bidPending: !isKnownBidInfo(bidInfo) };
        }
        return bidInfo;
      })
    }
  }

  initRound() {
    if (this.roundNumber < this.maxCardsPerPlayer) {
      this.numberOfCardsPerPlayer = this.roundNumber;
      this.stage = RoundStage.ASC;
    } else if (this.roundNumber < this.maxCardsPerPlayer + this.playerIds.length) {
      this.numberOfCardsPerPlayer = this.maxCardsPerPlayer;
      this.stage = RoundStage.NO_TRUMPS;
    } else {
      this.numberOfCardsPerPlayer = (2 * (this.maxCardsPerPlayer - 1) + this.playerIds.length) - this.roundNumber + 1;
      this.stage = RoundStage.DESC;
    }
    // TODO temp
    this.numberOfCardsPerPlayer = 8;
    this.stage = RoundStage.NO_TRUMPS;

    this.currentPlayerId = this.startingPlayerId;
  }

  initBids() {
    this.bids = this.playerIds.map((playerId: string) => {
      return {
        playerId,
        bidPending: true
      }
    });
  }

  generateCards() {
    const unshuffledDeck = Card.generateUnshuffledDeck(this.maxCardsPerPlayer * this.playerIds.length);
    for (let i = 0; i < this.numberOfCardsPerPlayer; i++) {
      this.playerIds.forEach((playerId: string) => {
        const randomIndex = Math.floor(Math.random() * unshuffledDeck.length);
        const [card] = unshuffledDeck.splice(randomIndex,1);
        card.ownerId = playerId;
        this.cards.push(card);
      });
    }
    if (this.stage !== RoundStage.NO_TRUMPS) {
      const randomIndex = Math.floor(Math.random() * unshuffledDeck.length);
      this.trumpCard = unshuffledDeck[randomIndex];
    }
    this.cards.push(...unshuffledDeck);
  }

  getCardById(cardId: string): Card {
    return this.cards.find((card: Card) => card.id === cardId) ?? null;
  }

  getCardsOwnedBy(playerId: string, onlyNotPlayed = false): Card[] {
    return this.cards.filter((card: Card) => card.ownerId === playerId && !(onlyNotPlayed && card.played));
  }

  getCardsOnTurn(turnNumber: number): Card[] {
    return this.cards
      .filter((card: Card) => card.playedOnTurn === turnNumber)
      .sort((cardA: Card, cardB: Card) => cardA.compareByPlayedOrderPosition(cardB));
  }

  getTurnWinningCard(turnNumber: number): Card {
    return this.getCardsOnTurn(turnNumber).reduce((winningCard, currentCard) => {
      if (winningCard === null) { return currentCard; }
      else if (winningCard.suit === currentCard.suit) {
        return winningCard.compareByValue(currentCard) > 0 ? winningCard : currentCard;
      }
      else if (winningCard.suit !== this.trumpCard.suit && currentCard.suit === this.trumpCard.suit) { return currentCard; }
      else { return winningCard; }
    }, null);
  }

  placeBid(playerId: string, bid: number) {
    if (this.status !== RoundStatus.BIDDING) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: { reason: OuistitiInvalidActionReason.BIDDING_FINISHED }
      });
    }
    if (this.playerIds.indexOf(playerId) === -1) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        detail: { provided: playerId }
      });
    }
    if (bid < 0 || bid > this.numberOfCardsPerPlayer) {
      throw new OuistitiException({
        type: OuistitiErrorType.NUMBER_OUT_OF_RANGE,
        detail: { provided: bid, minimum: 0, maximum: this.numberOfCardsPerPlayer },
        param: 'bid'
      });
    }

    const bidInfoIndex = this.bids.findIndex((bid: BidInfo) => bid.playerId === playerId);
    const newBid: KnownBidInfo = { playerId, bid };
    this.bids[bidInfoIndex] = newBid;
    this.bidPlacedSource.next(newBid);
  }

  cancelBid(playerId: string) {
    if (this.playerIds.indexOf(playerId) === -1) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        detail: { provided: playerId }
      });
    }

    const bidInfoIndex = this.bids.findIndex((bid: BidInfo) => bid.playerId === playerId);
    this.bids[bidInfoIndex] = { playerId, bidPending: true };
    this.bidCancelledSource.next(playerId);
  }

  finaliseBids() {
    if (this.status === RoundStatus.BIDDING) {
      this.status = RoundStatus.PLAY;

      this.bids = this.bids.map((bidInfo: BidInfo) => {
        if (isKnownBidInfo(bidInfo)) {
          return bidInfo;
        } else {
          // Assign to the player the most likely average bid for that round
          const automaticallyChosenBid: KnownBidInfo = {
            playerId: bidInfo.playerId,
            bid: Math.round(this.numberOfCardsPerPlayer / this.playerIds.length)
          }
          return automaticallyChosenBid;
        }
      });

      this.statusChangedSource.next({
        status: this.status,
        finalBids: this.bids as KnownBidInfo[]
      });
    }
  }

  playCard(playerId: string, cardId: string) {
    if (this.status !== RoundStatus.PLAY || playerId !== this.currentPlayerId) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.NOT_PLAYERS_TURN
        }
      });
    }

    const card = this.getCardById(cardId);
    if (!card) {
      throw new OuistitiException({
        type: OuistitiErrorType.PLAYER_DOESNT_HAVE_CARD,
        detail: {
          provided: cardId,
          actual: this.getCardsOwnedBy(playerId, true).map((card: Card) => card.id)
        },
        param: 'id'
      });
    }
    const cardsPlayedThisTurn = this.getCardsOnTurn(this.currentTurnNumber);
    card.playedOnTurn = this.currentTurnNumber;
    card.playedOrderPosition = cardsPlayedThisTurn.length + 1;
    this.currentPlayerId = this.playerIds[(this.playerIds.indexOf(this.currentPlayerId) + 1) % this.playerIds.length];

    const turnFinished = card.playedOrderPosition === this.playerIds.length;

    const observed: CardPlayedObserved = { card };
    if (!turnFinished) {
      observed.nextPlayerId = this.currentPlayerId;
    }
    this.cardPlayedSource.next(observed);

    if (turnFinished) {
      this.completeTurn();
    }

  }

  completeTurn() {
    const winningCard = this.getTurnWinningCard(this.currentTurnNumber);
    if (!this.isLastTurn) {
      this.currentTurnNumber++;
      this.currentPlayerId = winningCard.ownerId;
    }

    this.turnFinishedSource.next(winningCard);
    if (this.isLastTurn) {
      this.completeRound();
    }
  }

  completeRound() {
    this.status = RoundStatus.COMPLETED;
    this.statusChangedSource.next({
      status: this.status
    });
    this.statusChangedSource.complete();
  }
}
