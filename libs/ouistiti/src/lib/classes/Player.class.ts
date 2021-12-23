import { nanoid } from 'nanoid'
import { Socket } from 'socket.io';
import { PlayerColour, PlayerInfo, PlayerSymbol } from '@TomikaArome/ouistiti-shared';

export class Player {
  id: string = 'ouistiti-player-' + nanoid();
  nickname = '';
  colour: PlayerColour;
  symbol: PlayerSymbol;
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  isVacant(): boolean {
    return !this.socket?.connected;
  }

  getPlayerInfo(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      colour: this.colour,
      symbol: this.symbol
    }
  }
}
