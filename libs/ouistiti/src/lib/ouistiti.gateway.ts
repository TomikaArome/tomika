import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { BidParams, LobbyCreateParams, LobbyJoinParams, LobbyUpdateParams, OuistitiErrorType, PlayerKickParams, PlayerUpdateParams } from '@TomikaArome/ouistiti-shared';
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
    const temp = new Lobby(params, (player: Player) => {
      controller.player = player;
    });
    temp.addPlayer({ id: '', player: { nickname: 'Claire' } });
    temp.addPlayer({ id: '', player: { nickname: 'Steve' } });
    temp.addPlayer({ id: '', player: { nickname: 'David' } });
    temp.startGame({ maxCardsPerPlayer: 8 });
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
      controller.player.lobby.removePlayer(controller.player);
    }
  }

  @UseFilters(new OuistitiExceptionFilter('updateLobby'))
  @SubscribeMessage('updateLobby')
  updateLobby(controller: SocketController, params: LobbyUpdateParams) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkIfHost(controller);

    if (params.hostId) { controller.player.lobby.changeHost(params.hostId); }
    if (params.playerOrder) { controller.player.lobby.changeOrder(params.playerOrder); }
    if (params.maxNumberOfPlayers !== undefined) { controller.player.lobby.changeMaxNumberOfPlayers(params.maxNumberOfPlayers); }
  }

  @UseFilters(new OuistitiExceptionFilter('updatePlayer'))
  @SubscribeMessage('updatePlayer')
  updatePlayer(controller: SocketController, params: PlayerUpdateParams) {
    OuistitiException.checkIfInLobby(controller);
    if (!params.id) { params.id = controller.player.id; }
    if (params.id !== controller.player.id) {
      OuistitiException.checkIfHost(controller);
    }

    const player = controller.player.lobby.getPlayerByIdAndThrowIfNotFound(params.id);
    if (params.nickname) { controller.player.lobby.changePlayerNickname(player, params.nickname); }
    if (params.colour) { controller.player.lobby.changePlayerColour(player, params.colour); }
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

    const player = controller.player.lobby.getPlayerByIdAndThrowIfNotFound(params.id);
    controller.player.lobby.removePlayer(player);
  }

  @UseFilters(new OuistitiExceptionFilter('startGame'))
  @SubscribeMessage('startGame')
  startGame(controller: SocketController) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkIfHost(controller);

    controller.player.lobby.startGame({
      maxCardsPerPlayer: 8
    })
  }

  @UseFilters(new OuistitiExceptionFilter('placeBid'))
  @SubscribeMessage('placeBid')
  placeBid(controller: SocketController, params: BidParams) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkGameStarted(controller.player.lobby);
    OuistitiException.checkRequiredParams(params, ['bid']);

    controller.player.lobby.game.currentRound.placeBid(controller.player.id, params.bid);
  }

  @UseFilters(new OuistitiExceptionFilter('cancelBid'))
  @SubscribeMessage('cancelBid')
  cancelBid(controller: SocketController) {
    OuistitiException.checkIfInLobby(controller);
    OuistitiException.checkGameStarted(controller.player.lobby);

    controller.player.lobby.game.currentRound.cancelBid(controller.player.id);
  }
}
