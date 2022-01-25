import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { CARD_ORDER, CardInfo, CardSuit, KnownCardInfo, OwnedAndKnownCardInfo, OwnedAndUnknownCardInfo, PlayedCardInfo, PlayerInfo, RoundInfo, RoundStatus, TrumpCardInfo, WonCardInfo } from '@TomikaArome/ouistiti-shared';

interface PlayerRoundDetailsPosition {
  x: number;
  y: number;
  angle: number;
  width?: number;
  height?: number;
}

interface CardPosition {
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  rotation?: number;
  playable?: boolean;
}

@Component({
  selector: 'tmk-ouistiti-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.scss']
})
export class CardContainerComponent implements OnInit {
  @Input()
  roundInfo: RoundInfo;
  @Input()
  players: PlayerInfo[];
  @Input()
  selfId: string;

  private containerWidth: number;
  private containerHeight: number;

  get cards() {
    return this.roundInfo.cards ?? [];
  }

  get playersWithoutSelf(): PlayerInfo[] {
    const playersInOrder = [...this.players];
    playersInOrder.sort((pA: PlayerInfo, pB: PlayerInfo) =>
      this.roundInfo.playerOrder.indexOf(pA.id) - this.roundInfo.playerOrder.indexOf(pB.id));
    const selfIndex = playersInOrder.findIndex((player: PlayerInfo) => player.id === this.selfId);
    return [...playersInOrder.slice(selfIndex + 1), ...playersInOrder.slice(0, selfIndex)];
  }

  get areBidsStillPending(): boolean {
    return this.roundInfo?.status === RoundStatus.BIDDING;
  }

  get trumpCardOutsideWrapperStyle() {
    const cardPos = this.getUnownedCardPosition();
    return {
      transform: `translate(${cardPos.x}px,${cardPos.y}px)`
    };
  }

  get hasTrumps(): boolean {
    return this.roundInfo.cards.findIndex((c: CardInfo) => (c as TrumpCardInfo).isTrumpCard) > -1;
  }

  private static toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  private static getAngle(distance: number, radius: number): number {
    const twoRSquared = 2 * radius * radius;
    const radians = Math.acos((twoRSquared - distance * distance) / twoRSquared);
    return radians * 180 / Math.PI;
  }

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    this.setContainerSizes();
  }

  @HostListener('window:resize')
  setContainerSizes() {
    this.containerWidth = (this.elRef.nativeElement as HTMLElement).getBoundingClientRect().width / 2;
    this.containerHeight = (this.elRef.nativeElement as HTMLElement).getBoundingClientRect().height / 2;
  }

  cardsWonByPlayer(playerId: string): WonCardInfo[] {
    return this.cards.filter((c: CardInfo) => (c as WonCardInfo).winnerId === playerId) as WonCardInfo[];
  }
  playerBid(playerId: string): number {
    return this.roundInfo.bids[playerId] ?? -1;
  }

  playerRoundDetailsStyle(pos: PlayerRoundDetailsPosition) {
    return {
      transform: `translate(${pos.x}px,${pos.y}px)`
    }
  }

  cardStyle(pos: CardPosition) {
    return {
      transform: `translate(${pos.x}px,${pos.y}px) rotate(${pos.rotation}deg)`,
      zIndex: pos.z
    }
  }

  getPlayerRoundDetailsPosition(playerId: string): PlayerRoundDetailsPosition {
    const players = this.playersWithoutSelf.map((player: PlayerInfo) => player.id);

    let rx, ry, width, height;
    const el = ((this.elRef.nativeElement as HTMLElement)
      .querySelector('#player-round-details-' + playerId) as HTMLElement);
    if (el) {
      const box = el.getBoundingClientRect();
      rx = this.containerWidth - box.width / 2;
      ry = this.containerHeight - box.height / 2;
      width = box.width;
      height = box.height;
    }

    if (playerId === this.selfId) {
      return {
        x: -rx,
        y: ry,
        angle: 180
      }
    } else {
      const maxAngle = 180;
      const angleStep = maxAngle / (players.length - 1);
      const angle = (players.indexOf(playerId) - ((players.length - 1) / 2)) * angleStep;

      return {
        x: Math.cos(CardContainerComponent.toRadians(angle - 90)) * rx,
        y: Math.sin(CardContainerComponent.toRadians(angle - 90)) * ry,
        angle,
        width,
        height
      }
    }
  }

  getCardPosition(card: CardInfo): CardPosition {
    let cardPos: CardPosition;

    if ((card as OwnedAndUnknownCardInfo).ownerId === undefined) {
      cardPos = this.getUnownedCardPosition();
    } else if ((card as WonCardInfo).winnerId !== undefined) {
      cardPos = this.getWonCardPosition(card as WonCardInfo);
    } else if ((card as PlayedCardInfo).playedOnTurn !== undefined) {
      cardPos = this.getPlayedCardPosition(card as PlayedCardInfo);
    } else if ((card as OwnedAndKnownCardInfo).ownerId === this.selfId) {
      cardPos = this.getCardPositionInOwnHand(card as OwnedAndKnownCardInfo);
    } else {
      cardPos = this.getCardPositionInOtherHand(card as OwnedAndUnknownCardInfo);
    }

    return {
      x: 0,
      y: 0,
      z: 0,
      width: 125,
      height: 175,
      rotation: 0,
      playable: false,
      ...cardPos
    }
  }

  sortCards(cardsToSort: KnownCardInfo[]): KnownCardInfo[] {
    const suits = Object.values(CardSuit);
    return cardsToSort.sort((cA: OwnedAndKnownCardInfo, cB: OwnedAndKnownCardInfo) => {
      let diff = suits.indexOf(cA.suit) - suits.indexOf(cB.suit);
      if (diff === 0) {
        diff = CARD_ORDER.indexOf(cA.value) - CARD_ORDER.indexOf(cB.value);
      }
      return diff;
    })
  }

  isCardPlayable(card: OwnedAndKnownCardInfo, cardsInHand: OwnedAndKnownCardInfo[]): boolean {
    if (this.roundInfo.status !== RoundStatus.PLAY || this.roundInfo.currentPlayerId !== card.ownerId) { return false; }
    const leadingCard = this.roundInfo.cards.find((c: PlayedCardInfo) =>
      c.playedOnTurn === this.roundInfo.currentTurnNumber && c.playedOrderPosition === 1) as PlayedCardInfo;
    if (!leadingCard || card.suit === leadingCard.suit) { return true; }
    return cardsInHand.findIndex((c: OwnedAndKnownCardInfo) => c.suit === leadingCard.suit) === -1;
  }

  getCardPositionInOwnHand(card: OwnedAndKnownCardInfo): CardPosition {
    let cardsInHand: OwnedAndKnownCardInfo[] = this.cards.filter((c: CardInfo) => {
      return (c as OwnedAndKnownCardInfo).ownerId === card.ownerId
        && (c as PlayedCardInfo).playedOnTurn === undefined;
    }) as OwnedAndKnownCardInfo[];
    cardsInHand = this.sortCards(cardsInHand) as OwnedAndKnownCardInfo[];

    const radius = 1000;
    const spreadDistance = 100;
    const angleStep = CardContainerComponent.getAngle(spreadDistance, radius);
    const angle = (cardsInHand.indexOf(card) - ((cardsInHand.length - 1) / 2)) * angleStep;
    const angleOfFirstCard = (-(cardsInHand.length - 1) / 2) * angleStep;

    return {
      x: Math.cos(CardContainerComponent.toRadians(angle - 90)) * radius,
      y: this.containerHeight - (Math.sin(CardContainerComponent.toRadians(angle + 90)) - Math.sin(CardContainerComponent.toRadians(angleOfFirstCard + 90))) * radius - 125,
      z: cardsInHand.indexOf(card),
      rotation: angle,
      playable: this.isCardPlayable(card, cardsInHand)
    }
  }

  getCardPositionInOtherHand(card: OwnedAndUnknownCardInfo): CardPosition {
    const cardsInHand: OwnedAndUnknownCardInfo[] = (this.cards
      .filter((c: CardInfo) => {
        return (c as OwnedAndUnknownCardInfo).ownerId === card.ownerId
          && (c as PlayedCardInfo).playedOnTurn === undefined;
      }) as OwnedAndUnknownCardInfo[])
      .sort((cA: OwnedAndUnknownCardInfo, cB: OwnedAndUnknownCardInfo) => cA.id.localeCompare(cB.id));

    const playerPos = this.getPlayerRoundDetailsPosition(card.ownerId);
    const maxArc = 90;
    const maxArcStep = maxArc / (cardsInHand.length - 1);
    const radius = (playerPos.width / 2 + playerPos.height / 2) / 2;
    const spreadDistance = 15;
    const angleStep = Math.min(CardContainerComponent.getAngle(spreadDistance, radius), maxArcStep);
    const angle = (cardsInHand.indexOf(card) - ((cardsInHand.length - 1) / 2)) * angleStep + playerPos.angle + 180;

    return {
      x: playerPos.x + Math.cos(CardContainerComponent.toRadians(angle - 90)) * playerPos.width / 2,
      y: playerPos.y + Math.sin(CardContainerComponent.toRadians(angle - 90)) * playerPos.height / 2,
      z: cardsInHand.indexOf(card),
      height: 100,
      rotation: angle
    };
  }

  getUnownedCardPosition(): CardPosition {
    const padding = 20;
    const cardHeight = 125;
    const cardWidth = cardHeight / 7 * 5;
    return {
      x: this.containerWidth - cardWidth / 2 - padding,
      y: this.containerHeight - cardHeight / 2 - padding,
      width: cardWidth,
      height: cardHeight
    };
  }

  getWonCardPosition(card: WonCardInfo): CardPosition {
    const playerPos = this.getPlayerRoundDetailsPosition(card.winnerId);
    return {
      x: playerPos.x,
      y: playerPos.y,
      z: 0,
      height: 50
    };
  }

  getPlayedCardPosition(card: PlayedCardInfo): CardPosition {
    const playerPos = this.getPlayerRoundDetailsPosition(card.ownerId);
    const rx = this.containerWidth / 5;
    const ry = this.containerHeight / 5;
    return {
      x: Math.cos(CardContainerComponent.toRadians(playerPos.angle - 90)) * rx,
      y: Math.sin(CardContainerComponent.toRadians(playerPos.angle - 90)) * ry,
      z: card.playedOrderPosition,
      height: 125,
      rotation: playerPos.angle
    };
  }
}
