import { nanoid } from 'nanoid';
import {
  GameStatus,
  NICKNAME_MAX_LENGTH,
  OuistitiErrorType,
  PlayerColour,
  PlayerCreateParams,
  PlayerInfo,
  PlayerSymbol,
} from '@TomikaArome/ouistiti-shared';
import { OuistitiException } from './ouistiti-exception.class';
import { Subject } from 'rxjs';
import { Lobby } from './lobby.class';

export class Player {
  id: string = nanoid(10);
  nickname: string;
  colour: PlayerColour;
  symbol: PlayerSymbol;
  lobby: Lobby;
  isVacant = false;

  get info(): PlayerInfo {
    return {
      id: this.id,
      nickname: this.nickname,
      colour: this.colour,
      symbol: this.symbol,
      vacant: this.isVacant,
    };
  }

  private nicknameChangedSource = new Subject<string>();
  private colourChangedSource = new Subject<PlayerColour>();
  private symbolChangedSource = new Subject<PlayerSymbol>();
  private vacancyChangedSource = new Subject<boolean>();

  nicknameChanged$ = this.nicknameChangedSource.asObservable();
  colourChanged$ = this.colourChangedSource.asObservable();
  symbolChanged$ = this.symbolChangedSource.asObservable();
  vacancyChanged$ = this.vacancyChangedSource.asObservable();

  static createNewPlayer(lobby: Lobby, params: PlayerCreateParams): Player {
    OuistitiException.checkRequiredParams(params, ['nickname']);
    Player.validateNickname(params.nickname);

    const player = new Player();

    player.nickname = params.nickname;
    player.colour = params.colour ?? Player.getRandomColour();
    player.symbol = params.symbol ?? Player.getRandomSymbol();
    player.lobby = lobby;

    return player;
  }

  private static getRandomColour(exclude: PlayerColour[] = []): PlayerColour {
    const colourKeys = Object.keys(PlayerColour).filter(
      (colour) => !Object.keys(exclude).includes(colour)
    );
    if (colourKeys.length === 0) {
      return null;
    }
    return PlayerColour[
      colourKeys[Math.floor(Math.random() * colourKeys.length)]
    ];
  }

  private static getRandomSymbol(): PlayerSymbol {
    const symbolKeys = Object.keys(PlayerSymbol);
    return PlayerSymbol[
      symbolKeys[Math.floor(Math.random() * symbolKeys.length)]
    ];
  }

  private static validateNickname(nickname: string) {
    if (nickname.length > NICKNAME_MAX_LENGTH) {
      throw new OuistitiException({
        type: OuistitiErrorType.STRING_TOO_LONG,
        param: 'nickname',
        detail: {
          value: nickname,
          requiredLength: NICKNAME_MAX_LENGTH,
          actualLength: nickname.length,
        },
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

  changeVacancy(isVacant: boolean) {
    if (isVacant !== this.isVacant) {
      this.isVacant = isVacant;
      if (isVacant && this.lobby?.gameStatus === GameStatus.IN_PROGRESS) {
        this.lobby.game.changeStatus(GameStatus.SUSPENDED);
      }
      this.vacancyChangedSource.next(isVacant);
    }
  }
}
