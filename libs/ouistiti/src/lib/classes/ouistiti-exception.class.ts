import { GameStatus, OuistitiError, OuistitiErrorType, OuistitiInvalidActionReason } from '@TomikaArome/ouistiti-shared';
import { WsException } from '@nestjs/websockets';
import { SocketController } from '../controllers/socket.controller';
import { Lobby } from './lobby.class';

export class OuistitiException extends WsException {
  static requiredParam(requiredParamKey: string): OuistitiException {
    return new OuistitiException({
      type: OuistitiErrorType.REQUIRED_PARAM,
      param: requiredParamKey
    });
  }

  static checkRequiredParams(obj: unknown, keys: string[]) {
    keys.forEach((fullKey: string) => {
      const splitKey: string[] = fullKey.split('.');
      splitKey.reduce((acc: unknown, currentKey: string) => {
        if (!acc[currentKey]) { throw OuistitiException.requiredParam(fullKey); }
        return acc[currentKey];
      }, obj);
    });
  }

  static checkIfInLobby(controller: SocketController) {
    if (!controller.inLobby) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.NOT_IN_LOBBY
        }
      });
    }
  }

  static checkIfHost(controller: SocketController) {
    if (controller.player !== controller.player.lobby.host) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ACTION,
        detail: {
          reason: OuistitiInvalidActionReason.NOT_HOST
        }
      });
    }
  }

  static checkGameStatus(lobby: Lobby, status: GameStatus) {

  }

  constructor(error: OuistitiError) {
    super(error);
  }

  getError(): OuistitiError {
    return super.getError() as OuistitiError;
  }
}
