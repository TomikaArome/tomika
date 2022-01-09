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

  get isVacant(): boolean {
    // TODO
    return false;
  }

  get info(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      colour: this.colour,
      symbol: this.symbol,
      vacant: this.isVacant
    }
  }

  private nicknameChangedSource = new Subject<string>();
  nicknameChanged$ = this.nicknameChangedSource.asObservable();
  private colourChangedSource = new Subject<PlayerColour>();
  colourChanged$ = this.colourChangedSource.asObservable();
  private symbolChangedSource = new Subject<PlayerSymbol>();
  symbolChanged$ = this.symbolChangedSource.asObservable();

  static createNewPlayer(params: PlayerCreateParams): Player {
    OuistitiException.checkRequiredParams(params, ['nickname']);
    Player.validateNickname(params.nickname);

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

  private static validateNickname(nickname: string) {
    if (nickname.length > NICKNAME_MAX_LENGTH) {
      throw new OuistitiException({
        type: OuistitiErrorType.STRING_TOO_LONG,
        param: 'nickname',
        detail: {
          value: nickname,
          requiredLength: NICKNAME_MAX_LENGTH,
          actualLength: nickname.length
        }
      });
    }
  }

  changeNickname(nickname: string) {
    Player.validateNickname(nickname);
    this.nickname = nickname;
    this.nicknameChangedSource.next(nickname);
  }

  changeColour(colour: PlayerColour) {
    this.colour = colour;
    this.colourChangedSource.next(colour);
  }

  changeSymbol(symbol: PlayerSymbol) {
    this.symbol = symbol;
    this.symbolChangedSource.next(symbol);
  }
}
