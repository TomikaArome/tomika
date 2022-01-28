import { Card } from './card.class';
import { OuistitiException } from './ouistiti-exception.class';
import { BidInfo, OuistitiErrorType, OuistitiInvalidActionReason, RoundInfo, RoundStatus } from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BidCancelledObserved, BidPlacedObserved, CardPlayedObserved, NewTurnStartedObserved } from '../interfaces/round-observed.interface';
import { BreakPoint } from './break-point.class';

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
  bids: BidInfo = {};
  breakPoint: BreakPoint;
  manualBreakPointInProgress = false;

  readonly playerIds: string[];
  readonly maxCardsPerPlayer: number;

  private statusChangedSource = new Subject<RoundStatus>();
  private bidPlacedSource = new Subject<BidPlacedObserved>();
  private bidCancelledSource = new Subject<BidCancelledObserved>();
  private cardPlayedSource = new Subject<CardPlayedObserved>();
  private newTurnStartedSource = new Subject<NewTurnStartedObserved>();
  private breakPointAcknowledgedSource = new Subject<string>();

  statusChanged$ = this.statusChangedSource.asObservable();
  bidsFinalised$ = this.statusChanged$.pipe(filter((status: RoundStatus) => status === RoundStatus.PLAY));
  completed$ = this.statusChanged$.pipe(filter((status: RoundStatus) => status === RoundStatus.COMPLETED));
  bidPlaced$ = this.bidPlacedSource.asObservable().pipe(takeUntil(this.bidsFinalised$));
  bidCancelled$ = this.bidCancelledSource.asObservable().pipe(takeUntil(this.bidsFinalised$));
  cardPlayed$ = this.cardPlayedSource.asObservable().pipe(takeUntil(this.completed$));
  newTurnStarted$ = this.newTurnStartedSource.asObservable().pipe(takeUntil(this.completed$));
  breakPointAcknowledged$ = this.breakPointAcknowledgedSource.asObservable();

  get isLastTurn(): boolean {
    return this.currentTurnNumber === this.numberOfCardsPerPlayer;
  }

  get isLastRound(): boolean {
    return this.numberOfCardsPerPlayer === 1 && this.stage === RoundStage.DESC;
  }

  get startingPlayerId(): string {
    return this.playerIds[(this.roundNumber - 1) % this.playerIds.length];
  }

  get info(): RoundInfo {
    const info: RoundInfo = {
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
    if (this.breakPoint && !this.breakPoint.ended) {
      info.breakPoint = this.breakPoint.info;
    }
    return info;
  }

  static createNewRound(settings: RoundSettings): Round {
    const round = new Round(settings);
    round.initRound();
    round.generateCards();
    round.initBiddingBreakPoint();
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
      bids: this.bidsKnownToPlayer(playerId)
    }
  }

  bidsKnownToPlayer(playerId: string): BidInfo {
    return Object.keys(this.bids).reduce((acc: BidInfo, currPlayerId: string) => {
      if (this.status !== RoundStatus.BIDDING || currPlayerId === playerId) {
        acc[playerId] = this.bids[playerId];
      }
      return acc;
    }, {});
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

    this.currentPlayerId = this.startingPlayerId;
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

  initBiddingBreakPoint() {
    const biddingBreakPoint = new BreakPoint({
      duration: 120000,
      acknowledgements: this.playerIds,
      bufferDuration: 5000
    });
    biddingBreakPoint.resolved$.subscribe(() => {
      this.finaliseBids();
    });
    this.breakPoint = biddingBreakPoint;
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

    this.bids[playerId] = bid;
    this.breakPoint.acknowledge(playerId);
    const payload: BidPlacedObserved = { playerId, bid };
    this.bidPlacedSource.next(payload);
  }

  cancelBid(playerId: string) {
    if (this.playerIds.indexOf(playerId) === -1) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        detail: { provided: playerId }
      });
    }

    delete this.bids[playerId];
    this.breakPoint.cancelAcknowledgement(playerId);
    const payload: BidCancelledObserved = { playerId };
    this.bidCancelledSource.next(payload);
  }

  finaliseBids() {
    if (this.status === RoundStatus.BIDDING) {
      this.status = RoundStatus.PLAY;
      this.breakPoint = null;

      this.playerIds.forEach((playerId: string) => {
        if (Object.keys(this.bids).indexOf(playerId) === -1) {
          // Assign to the player the most likely average bid for that round
          this.bids[playerId] = Math.round(this.numberOfCardsPerPlayer / this.playerIds.length);
        }
      });

      this.statusChangedSource.next(this.status);
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

    let affectedCards: Card[] = [card];

    if (card.playedOrderPosition === this.playerIds.length) {
      const winningCard = this.getTurnWinningCard(this.currentTurnNumber);

      affectedCards = this.cards.filter((card: Card) => card.playedOnTurn === this.currentTurnNumber);
      affectedCards.forEach((card: Card) => {
        card.winnerId = winningCard.ownerId;
      });

      const endOfTurnBreakPoint = new BreakPoint({
        duration: 10000,
        acknowledgements: this.playerIds
      });
      endOfTurnBreakPoint.acknowledged$.subscribe(() => {
        this.breakPointAcknowledgedSource.next(playerId);
      });
      endOfTurnBreakPoint.resolved$.subscribe(() => {
        this.manualBreakPointInProgress = false;
        this.completeTurn();
      });
      this.breakPoint = endOfTurnBreakPoint;
      this.manualBreakPointInProgress = true;
    }

    const observed: CardPlayedObserved = {
      affectedCards,
      nextPlayerId: this.currentPlayerId
    };
    this.cardPlayedSource.next(observed);

  }

  acknowledgeBreakPoint(playerId: string) {
    if (this.manualBreakPointInProgress && this.breakPoint) {
      this.breakPoint.acknowledge(playerId);
    }
  }

  completeTurn() {
    if (this.isLastTurn) {
      this.completeRound();
    } else {
      const winningCard = this.getTurnWinningCard(this.currentTurnNumber);
      this.currentTurnNumber++;
      this.currentPlayerId = winningCard.ownerId;
      this.newTurnStartedSource.next({
        newTurnNumber: this.currentTurnNumber,
        newTurnFirstPlayerId: this.currentPlayerId
      });
    }
  }

  completeRound() {
    console.log('completed round');
    this.status = RoundStatus.COMPLETED;
    this.statusChangedSource.next(this.status);
    this.statusChangedSource.complete();
  }
}
