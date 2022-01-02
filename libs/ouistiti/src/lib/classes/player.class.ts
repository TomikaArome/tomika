import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import {
  NICKNAME_MAX_LENGTH,
  OuistitiErrorType,
  PlayerColour,
  PlayerCreate,
  PlayerInfo,
  PlayerSymbol
} from '@TomikaArome/ouistiti-shared';
import { OuistitiException } from './ouistiti-exception.class';

export class Player {
  id: string = nanoid();
  nickname: string;
  colour: PlayerColour;
  symbol: PlayerSymbol;
  socket: Socket;

  get info(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      colour: this.colour,
      symbol: this.symbol,
      vacant: this.isVacant()
    }
  }

  static createNewPlayer(socket: Socket, params: PlayerCreate): Player {
    OuistitiException.checkRequiredParams(params, ['nickname']);
    if (params.nickname.length > NICKNAME_MAX_LENGTH) {
      throw new OuistitiException({
        type: OuistitiErrorType.STRING_TOO_LONG,
        param: 'nickname',
        detail: {
          value: params.nickname,
          requiredLength: NICKNAME_MAX_LENGTH,
          actualLength: params.nickname.length
        }
      });
    }

    const player = new Player(socket);

    player.nickname = params.nickname;
    player.colour = params.colour ?? Player.getRandomColour();
    player.symbol = params.symbol ?? Player.getRandomSymbol();

    return player;
  }

  private static getRandomColour(exclude: PlayerColour[] = []): PlayerColour {
    const colourKeys = Object.keys(PlayerColour).filter(colour => !Object.keys(exclude).includes(colour));
    if (colourKeys.length === 0) { return null; }
    return PlayerColour[colourKeys[Math.floor(Math.random() * colourKeys.length)]];
  }

  private static getRandomSymbol(): PlayerSymbol {
    const symbolKeys = Object.keys(PlayerSymbol);
    return PlayerSymbol[symbolKeys[Math.floor(Math.random() * symbolKeys.length)]];
  }

  private constructor(socket: Socket) {
    this.socket = socket;
  }

  isVacant(): boolean {
    return !this.socket?.connected;
  }

  emit(eventName: string, payload?: unknown) {
    this.socket.emit(eventName, payload);
  }
}
