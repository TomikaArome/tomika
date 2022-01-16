import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { CARD_ORDER, CardInfo, CardSuit, KnownCardInfo, OwnedAndKnownCardInfo, OwnedAndUnknownCardInfo, PlayerInfo, RoundInfo } from '@TomikaArome/ouistiti-shared';

interface PlayerRoundDetailsPosition {
  x: number;
  y: number;
}

interface CardPosition {
  x?: number;
  y?: number;
  z?: number;
  height?: number;
  rotation?: number;
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
    const selfIndex = this.players.findIndex((player: PlayerInfo) => player.id === this.selfId);
    return [...this.players.slice(selfIndex + 1), ...this.players.slice(0, selfIndex)];
    // return this.players.filter((player: PlayerInfo) => player.id !== this.selfId);
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
    const padding = 20;
    const players = this.playersWithoutSelf.map((player: PlayerInfo) => player.id);
    let rx, ry;
    const el = ((this.elRef.nativeElement as HTMLElement)
      .querySelector('#player-round-details-' + playerId) as HTMLElement);
    if (el) {
      const box = el.getBoundingClientRect();
      rx = this.containerWidth - box.width / 2 - padding;
      ry = this.containerHeight - box.height / 2 - padding;
    }

    const maxAngle = 180;
    const angleStep = maxAngle / (players.length - 1);
    const angle = (players.indexOf(playerId) - ((players.length - 1) / 2)) * angleStep;

    return {
      x: Math.cos(this.toRadians(angle - 90)) * rx,
      y: Math.sin(this.toRadians(angle - 90)) * ry
    }
  }

  getCardPosition(card: CardInfo): CardPosition {
    let cardPos: CardPosition = {};

    if ((card as OwnedAndKnownCardInfo).ownerId === this.selfId) {
      cardPos = this.getCardPositionInOwnHand(card as OwnedAndKnownCardInfo);
    } else if ((card as OwnedAndUnknownCardInfo).ownerId !== undefined) {
      cardPos = this.getCardPositionInOtherHand(card as OwnedAndUnknownCardInfo);
    }

    return {
      x: 0,
      y: 0,
      z: 0,
      height: 175,
      rotation: 0,
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

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }
  private getAngle(distance: number, radius: number): number {
    const twoRSquared = 2 * radius * radius;
    const radians = Math.acos((twoRSquared - distance * distance) / twoRSquared);
    return radians * 180 / Math.PI;
  }

  getCardPositionInOwnHand(card: OwnedAndKnownCardInfo): CardPosition {
    let cardsInHand: OwnedAndKnownCardInfo[] = this.cards.filter((c: CardInfo) => (c as OwnedAndKnownCardInfo).ownerId === card.ownerId) as OwnedAndKnownCardInfo[];
    cardsInHand = this.sortCards(cardsInHand) as OwnedAndKnownCardInfo[];

    const radius = 1000;
    const spreadDistance = 100;
    const angleStep = this.getAngle(spreadDistance, radius);
    const angle = (cardsInHand.indexOf(card) - ((cardsInHand.length - 1) / 2)) * angleStep;
    const angleOfFirstCard = (-(cardsInHand.length - 1) / 2) * angleStep;

    return {
      x: Math.cos(this.toRadians(angle - 90)) * radius,
      y: this.containerHeight - (Math.sin(this.toRadians(angle + 90)) - Math.sin(this.toRadians(angleOfFirstCard + 90))) * radius - 125,
      z: cardsInHand.indexOf(card),
      rotation: angle
    }
  }

  getCardPositionInOtherHand(card: OwnedAndUnknownCardInfo): CardPosition {
    const cardsInHand: OwnedAndUnknownCardInfo[] = this.cards.filter((c: CardInfo) => (c as OwnedAndUnknownCardInfo).ownerId === card.ownerId) as OwnedAndUnknownCardInfo[];

    return {};
  }
}
