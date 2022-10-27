import { Card } from './card.class';
import { OuistitiException } from './ouistiti-exception.class';
import {
  BidInfo,
  OuistitiErrorType,
  OuistitiInvalidActionReason,
  RoundInfo,
  RoundScores,
  RoundStatus,
} from '@TomikaArome/ouistiti-shared';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { BidPlacedObserved } from '../interfaces/round-observed.interface';
import { BreakPoint } from './break-point.class';

export interface RoundSettings {
  roundNumber: number;
  playerIds: string[];
  maxCardsPerPlayer: number;
  numberOfCardsPerPlayer: number;
}

export class Round {
  roundNumber: number;
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
  private bidCancelledSource = new Subject<string>();
  private cardPlayedSource = new Subject<Card>();
  private breakPointAcknowledgedSource = new Subject<string>();

  statusChanged$ = this.statusChangedSource.asObservable();
  bidsFinalised$ = this.statusChanged$.pipe(
    filter((status: RoundStatus) => status === RoundStatus.PLAY)
  );
  completed$ = this.statusChanged$.pipe(
    filter((status: RoundStatus) => status === RoundStatus.COMPLETED)
  );
  bidPlaced$ = this.bidPlacedSource
    .asObservable()
    .pipe(takeUntil(this.bidsFinalised$));
  bidCancelled$ = this.bidCancelledSource
    .asObservable()
    .pipe(takeUntil(this.bidsFinalised$));
  cardPlayed$ = this.cardPlayedSource
    .asObservable()
    .pipe(takeUntil(this.completed$));
  breakPointAcknowledged$ = this.breakPointAcknowledgedSource.asObservable();

  get isLastTurn(): boolean {
    return this.currentTurnNumber === this.numberOfCardsPerPlayer;
  }

  get startingPlayerId(): string {
    return this.playerIds[(this.roundNumber - 1) % this.playerIds.length];
  }

  get info(): RoundInfo {
    return {
      number: this.roundNumber,
      status: this.status,
      breakPoint:
        this.breakPoint && !this.breakPoint.ended ? this.breakPoint.info : null,
      currentPlayerId: this.currentPlayerId,
      currentTurnNumber: this.currentTurnNumber,
      playerOrder: this.playerIds,
      cards: this.cards.map((card: Card) => {
        if (card === this.trumpCard) {
          return { ...card.info, isTrumpCard: true };
        }
        return card.info;
      }),
      bids: this.bids,
    };
  }

  get scores(): RoundScores {
    const scores: RoundScores = {
      knownTrump: true,
      roundNumber: this.roundNumber,
      startingPlayerId: this.startingPlayerId,
      numberOfCards: this.numberOfCardsPerPlayer,
      playerScores: this.playerIds.map((playerId: string) => {
        return { playerId };
      }),
    };
    if (this.trumpCard) {
      scores.trump = this.trumpCard.suit;
    }
    if (this.status === RoundStatus.COMPLETED) {
      scores.playerScores = this.playerIds.map((playerId: string) => {
        const tricksWon = this.cards.reduce(
          (tricksWon: number[], card: Card) => {
            if (
              card.winnerId === playerId &&
              tricksWon.indexOf(card.playedOnTurn) === -1
            ) {
              tricksWon.push(card.playedOnTurn);
            }
            return tricksWon;
          },
          []
        );
        const pointDifference =
          this.bids[playerId] === tricksWon.length
            ? this.bids[playerId] + 10
            : -Math.abs(tricksWon.length - this.bids[playerId]);
        return {
          playerId,
          bid: this.bids[playerId],
          tricksWon: tricksWon.length,
          pointDifference,
        };
      });
    }
    return scores;
  }

  static createNewRound(settings: RoundSettings): Round {
    const round = new Round(settings);
    round.generateCards();
    round.initBiddingBreakPoint();
    return round;
  }

  constructor(settings: RoundSettings) {
    this.roundNumber = settings.roundNumber;
    this.playerIds = settings.playerIds;
    this.maxCardsPerPlayer = settings.maxCardsPerPlayer;
    this.numberOfCardsPerPlayer = settings.numberOfCardsPerPlayer;
    this.currentPlayerId = this.startingPlayerId;
  }

  infoKnownToPlayer(playerId: string): RoundInfo {
    return {
      ...this.info,
      cards: this.cards.map((card: Card) => {
        if (card === this.trumpCard) {
          return { ...card.info, isTrumpCard: true };
        }
        if (card.ownerId !== playerId && !card.played) {
          return card.incompleteInfo;
        }
        return card.info;
      }),
      bids: this.bidsKnownToPlayer(playerId),
    };
  }

  bidsKnownToPlayer(playerId: string): BidInfo {
    return Object.keys(this.bids).reduce(
      (acc: BidInfo, currPlayerId: string) => {
        if (this.status !== RoundStatus.BIDDING || currPlayerId === playerId) {
          acc[currPlayerId] = this.bids[currPlayerId];
        }
        return acc;
      },
      {}
    );
  }

  generateCards() {
    const unshuffledDeck = Card.generateUnshuffledDeck(
      this.maxCardsPerPlayer * this.playerIds.length
    );
    for (let i = 0; i < this.numberOfCardsPerPlayer; i++) {
      this.playerIds.forEach((playerId: string) => {
        const randomIndex = Math.floor(Math.random() * unshuffledDeck.length);
        const [card] = unshuffledDeck.splice(randomIndex, 1);
        card.ownerId = playerId;
        this.cards.push(card);
      });
    }
    if (this.numberOfCardsPerPlayer < this.maxCardsPerPlayer) {
      const randomIndex = Math.floor(Math.random() * unshuffledDeck.length);
      this.trumpCard = unshuffledDeck[randomIndex];
    }
    this.cards.push(...unshuffledDeck);
  }

  initBiddingBreakPoint() {
    const biddingBreakPoint = new BreakPoint({
      //duration: 10000,
      acknowledgements: this.playerIds,
      bufferDuration: 5000,
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
    return this.cards.filter(
      (card: Card) =>
        card.ownerId === playerId && !(onlyNotPlayed && card.played)
    );
  }

  getCardsOnTurn(turnNumber: number): Card[] {
    return this.cards
      .filter((card: Card) => card.playedOnTurn === turnNumber)
      .sort((cardA: Card, cardB: Card) =>
        cardA.compareByPlayedOrderPosition(cardB)
      );
  }

  getTurnWinningCard(turnNumber: number): Card {
    return this.getCardsOnTurn(turnNumber).reduce(
      (winningCard, currentCard) => {
        if (winningCard === null) {
          return currentCard;
        } else if (winningCard.suit === currentCard.suit) {
          return winningCard.compareByValue(currentCard) > 0
            ? winningCard
            : currentCard;
        } else if (
          this.trumpCard &&
          winningCard.suit !== this.trumpCard.suit &&
          currentCard.suit === this.trumpCard.suit
        ) {
          return currentCard;
        } else {
          return winningCard;
        }
      },
      null
    );
  }

  placeBid(playerId: string, bid: number) {
    if (this.status !== RoundStatus.BIDDING) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: { reason: OuistitiInvalidActionReason.BIDDING_FINISHED },
      });
    }
    if (this.playerIds.indexOf(playerId) === -1) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        detail: { provided: playerId },
      });
    }
    if (bid < 0 || bid > this.numberOfCardsPerPlayer) {
      throw new OuistitiException({
        type: OuistitiErrorType.NUMBER_OUT_OF_RANGE,
        detail: {
          provided: bid,
          minimum: 0,
          maximum: this.numberOfCardsPerPlayer,
        },
        param: 'bid',
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
        detail: { provided: playerId },
      });
    }

    delete this.bids[playerId];
    this.breakPoint.cancelAcknowledgement(playerId);
    this.bidCancelledSource.next(playerId);
  }

  finaliseBids() {
    if (this.status === RoundStatus.BIDDING) {
      this.status = RoundStatus.PLAY;
      this.breakPoint = null;

      this.playerIds.forEach((playerId: string) => {
        if (Object.keys(this.bids).indexOf(playerId) === -1) {
          // Assign to the player the most likely average bid for that round
          this.bids[playerId] = Math.round(
            this.numberOfCardsPerPlayer / this.playerIds.length
          );
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
          reason: OuistitiInvalidActionReason.NOT_PLAYERS_TURN,
        },
      });
    }

    const card = this.getCardById(cardId);
    if (!card) {
      throw new OuistitiException({
        type: OuistitiErrorType.PLAYER_DOESNT_HAVE_CARD,
        detail: {
          provided: cardId,
          actual: this.getCardsOwnedBy(playerId, true).map(
            (card: Card) => card.id
          ),
        },
        param: 'id',
      });
    }

    const leadingCard = this.cards.find(
      (c: Card) =>
        c.playedOnTurn === this.currentTurnNumber && c.playedOrderPosition === 1
    );
    if (
      leadingCard &&
      card.suit !== leadingCard.suit &&
      this.getCardsOwnedBy(playerId, true).findIndex(
        (c: Card) => c.suit === leadingCard.suit
      ) > -1
    ) {
      throw new OuistitiException({
        type: OuistitiErrorType.CARD_DOESNT_FOLLOW_SUIT,
        detail: {
          playedCard: card.info,
          leadingCard: leadingCard.info,
          playerHand: this.getCardsOwnedBy(playerId, true).map(
            (c: Card) => c.info
          ),
        },
      });
    }

    const cardsPlayedThisTurn = this.getCardsOnTurn(this.currentTurnNumber);
    card.playedOnTurn = this.currentTurnNumber;
    card.playedOrderPosition = cardsPlayedThisTurn.length + 1;
    this.currentPlayerId =
      this.playerIds[
        (this.playerIds.indexOf(this.currentPlayerId) + 1) %
          this.playerIds.length
      ];

    if (card.playedOrderPosition === this.playerIds.length) {
      this.status = RoundStatus.END_OF_TURN;
      const winningCard = this.getTurnWinningCard(this.currentTurnNumber);

      this.cards
        .filter((card: Card) => card.playedOnTurn === this.currentTurnNumber)
        .forEach((card: Card) => {
          card.winnerId = winningCard.ownerId;
        });

      const endOfTurnBreakPoint = new BreakPoint({
        duration: 5000,
        //acknowledgements: this.playerIds
      });
      endOfTurnBreakPoint.acknowledged$.subscribe(
        (acknowledgedPlayerId: string) => {
          this.breakPointAcknowledgedSource.next(acknowledgedPlayerId);
        }
      );
      endOfTurnBreakPoint.resolved$.subscribe(() => {
        this.manualBreakPointInProgress = false;
        this.completeTurn();
      });
      this.breakPoint = endOfTurnBreakPoint;
      this.manualBreakPointInProgress = true;
    }

    this.cardPlayedSource.next(card);
    if (this.status === RoundStatus.END_OF_TURN) {
      this.statusChangedSource.next(this.status);
    }
  }

  acknowledgeBreakPoint(playerId: string) {
    if (this.manualBreakPointInProgress && this.breakPoint) {
      this.breakPoint.acknowledge(playerId);
    }
  }

  completeTurn() {
    if (this.isLastTurn) {
      this.endOfRound();
    } else {
      const winningCard = this.getTurnWinningCard(this.currentTurnNumber);
      this.currentTurnNumber++;
      this.currentPlayerId = winningCard.ownerId;
      this.status = RoundStatus.PLAY;
      this.statusChangedSource.next(this.status);
    }
  }

  endOfRound() {
    const endOfRoundBreakPoint = new BreakPoint({
      //duration: 5000,
      acknowledgements: this.playerIds,
    });
    endOfRoundBreakPoint.acknowledged$.subscribe(
      (acknowledgedPlayerId: string) => {
        this.breakPointAcknowledgedSource.next(acknowledgedPlayerId);
      }
    );
    endOfRoundBreakPoint.resolved$.subscribe(() => {
      this.manualBreakPointInProgress = false;
      this.breakPointAcknowledgedSource.complete();
    });
    this.breakPoint = endOfRoundBreakPoint;
    this.manualBreakPointInProgress = true;

    this.status = RoundStatus.COMPLETED;
    this.statusChangedSource.next(this.status);
    this.statusChangedSource.complete();
  }
}
