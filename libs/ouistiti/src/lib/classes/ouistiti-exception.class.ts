import {
  GameStatus,
  OuistitiError,
  OuistitiErrorType,
  OuistitiInvalidActionReason,
} from '@TomikaArome/ouistiti-shared';
import { WsException } from '@nestjs/websockets';
import { SocketController } from '../controllers/socket.controller';
import { Lobby } from './lobby.class';

export class OuistitiException extends WsException {
  static requiredParam(requiredParamKey: string): OuistitiException {
    return new OuistitiException({
      type: OuistitiErrorType.REQUIRED_PARAM,
      param: requiredParamKey,
    });
  }

  static checkRequiredParams(obj: unknown, keys: string[]) {
    if (typeof obj !== 'object' || obj === null) {
      throw OuistitiException.requiredParam(keys[0]);
    }
    keys.forEach((fullKey: string) => {
      const splitKey: string[] = fullKey.split('.');
      splitKey.reduce((acc: unknown, currentKey: string) => {
        if (acc[currentKey] === undefined) {
          throw OuistitiException.requiredParam(fullKey);
        }
        return acc[currentKey];
      }, obj);
    });
  }

  static checkIfInLobby(controller: SocketController) {
    if (!controller.inLobby) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.NOT_IN_LOBBY,
        },
      });
    }
  }

  static checkIfHost(controller: SocketController) {
    if (controller.player !== controller.player.lobby.host) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.NOT_HOST,
        },
      });
    }
  }

  static checkGameStarted(lobby: Lobby) {
    if (lobby.gameStatus === GameStatus.INIT) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.GAME_NOT_STARTED,
        },
      });
    }
  }

  constructor(error: OuistitiError) {
    super(error);
  }

  getError(): OuistitiError {
    return super.getError() as OuistitiError;
  }
}
