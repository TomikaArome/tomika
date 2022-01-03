import { nanoid } from 'nanoid';
import {
  NICKNAME_MAX_LENGTH,
  OuistitiErrorType,
  PlayerColour,
  PlayerCreateParams,
  PlayerInfo,
  PlayerSymbol
} from '@TomikaArome/ouistiti-shared';
import { OuistitiException } from './ouistiti-exception.class';
import { Subject } from 'rxjs';

export class Player {
  id: string = nanoid();
  nickname: string;
  colour: PlayerColour;
  symbol: PlayerSymbol;

  get info(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      colour: this.colour,
      symbol: this.symbol,
      vacant: this.isVacant()
    }
  }

  static playerCreated$ = new Subject<Player>();

  static createNewPlayer(params: PlayerCreateParams): Player {
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

    const player = new Player();

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

  isVacant(): boolean {
    // TODO
    return false;
  }
}
