import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
  LobbyCreateParams,
  LobbyJoinParams,
  LobbyUpdateParams,
  OuistitiErrorType,
  PlayerKickParams,
  PlayerUpdateParams
} from '@TomikaArome/ouistiti-shared';
import { UseFilters, UsePipes } from '@nestjs/common';
import { OuistitiExceptionFilter } from './ouistiti-exception.filter';
import { SocketController } from './controllers/socket.controller';
import { OuistitiException } from './classes/ouistiti-exception.class';
import { Lobby } from './classes/lobby.class';
import { Player } from './classes/player.class';
import { SocketControllerPipe } from './socket-controller-pipe.service';

@UsePipes(new SocketControllerPipe())
@WebSocketGateway({
  namespace: 'ouistiti',
  cors: {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class OuistitiGateway {
  @UseFilters(new OuistitiExceptionFilter('listLobbies'))
  @SubscribeMessage('listLobbies')
  listLobbies(controller: SocketController) {
    controller.emitLobbyList();
  }

  @UseFilters(new OuistitiExceptionFilter('createLobby'))
  @SubscribeMessage('createLobby')
  createLobby(controller: SocketController, params: LobbyCreateParams) {
    OuistitiException.checkRequiredParams(params, ['host.nickname']);
    Lobby.createLobbyWithNewGame(params, (player: Player) => {
      controller.player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('joinLobby'))
  @SubscribeMessage('joinLobby')
  joinLobby(controller: SocketController, params: LobbyJoinParams) {
    OuistitiException.checkRequiredParams(params, ['id', 'player.nickname']);
    Lobby.getLobbyById(params.id).addPlayer(params, (player: Player) => {
      controller.player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('leaveLobby'))
  @SubscribeMessage('leaveLobby')
  leaveLobby(controller: SocketController) {
    if (controller.inLobby) {
      controller.lobby.removePlayer(controller.player);
    }
  }

  @UseFilters(new OuistitiExceptionFilter('updateLobby'))
  @SubscribeMessage('updateLobby')
  updateLobby(controller: SocketController, params: LobbyUpdateParams) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkIfHost(controller);

    if (params.hostId) { controller.lobby.changeHost(params.hostId); }
    if (params.playerOrder) { controller.lobby.changeOrder(params.playerOrder); }
    if (params.maxNumberOfPlayers !== undefined) { controller.lobby.changeMaxNumberOfPlayers(params.maxNumberOfPlayers); }
  }

  @UseFilters(new OuistitiExceptionFilter('updatePlayer'))
  @SubscribeMessage('updatePlayer')
  updatePlayer(controller: SocketController, params: PlayerUpdateParams) {
    OuistitiException.checkIfInLobby(controller);
    if (!params.id) { params.id = controller.player.id; }
    if (params.id !== controller.player.id) {
      OuistitiException.checkIfHost(controller);
    }

    const player = controller.lobby.getPlayerByIdAndThrowIfNotFound(params.id);
    if (params.nickname) { controller.lobby.changePlayerNickname(player, params.nickname); }
    if (params.colour) { controller.lobby.changePlayerColour(player, params.colour); }
    if (params.symbol) { player.changeSymbol(params.symbol); }
  }

  @UseFilters(new OuistitiExceptionFilter('kickPlayer'))
  @SubscribeMessage('kickPlayer')
  kickPlayer(controller: SocketController, params: PlayerKickParams) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkIfHost(controller);
    if (params.id === controller.player.id) {
      throw new OuistitiException({
        type: OuistitiErrorType.HOST_CANNOT_KICK_SELF
      });
    }

    const player = controller.lobby.getPlayerByIdAndThrowIfNotFound(params.id);
    controller.lobby.removePlayer(player);
  }
}
