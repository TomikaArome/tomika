import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import {
  GameStatus,
  LobbyCreateParams,
  LobbyFillVacancyParams,
  LobbyJoinParams,
  LobbyUpdateParams,
  OuistitiErrorType,
  PlaceBidParams,
  PlayCardParams,
  PlayerKickParams,
  PlayerUpdateParams, SkipRoundsParams
} from '@TomikaArome/ouistiti-shared';
import { UseFilters, UsePipes } from '@nestjs/common';
import { OuistitiExceptionFilter } from './ouistiti-exception.filter';
import { OuistitiException } from './classes/ouistiti-exception.class';
import { Lobby } from './classes/lobby.class';
import { Player } from './classes/player.class';
import { SocketControllerPipe } from './socket-controller-pipe.service';
import { Socket } from 'socket.io';
import { environment } from '../environments/environment';

@UsePipes(new SocketControllerPipe())
@WebSocketGateway({
  namespace: 'ouistiti',
  cors: {
    origin: environment.frontendUris || ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class OuistitiGateway {
  @UseFilters(new OuistitiExceptionFilter('listLobbies'))
  @SubscribeMessage('listLobbies')
  listLobbies(socket: Socket) {
    socket.data.controller.emitLobbyList();
  }

  @UseFilters(new OuistitiExceptionFilter('createLobby'))
  @SubscribeMessage('createLobby')
  createLobby(socket: Socket, params: LobbyCreateParams) {
    OuistitiException.checkRequiredParams(params, ['host.nickname']);
    new Lobby(params, (player: Player) => {
      socket.data.controller.player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('joinLobby'))
  @SubscribeMessage('joinLobby')
  joinLobby(socket: Socket, params: LobbyJoinParams) {
    OuistitiException.checkRequiredParams(params, ['id', 'player.nickname']);
    Lobby.getLobbyById(params.id).addPlayer(params, (player: Player) => {
      socket.data.controller.player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('leaveLobby'))
  @SubscribeMessage('leaveLobby')
  leaveLobby(socket: Socket) {
    if (socket.data.controller.inLobby) {
      socket.data.controller.player.lobby.removePlayer(
        socket.data.controller.player
      );
    }
  }

  @UseFilters(new OuistitiExceptionFilter('fillVacancy'))
  @SubscribeMessage('fillVacancy')
  fillVacancy(socket: Socket, params: LobbyFillVacancyParams) {
    OuistitiException.checkRequiredParams(params, ['lobbyId', 'playerId']);
    Lobby.getLobbyById(params.lobbyId).fillVacancy(params, (player: Player) => {
      socket.data.controller.player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('updateLobby'))
  @SubscribeMessage('updateLobby')
  updateLobby(socket: Socket, params: LobbyUpdateParams) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);

    if (params.hostId) {
      socket.data.controller.player.lobby.changeHost(params.hostId);
    }
    if (params.playerOrder) {
      socket.data.controller.player.lobby.changeOrder(params.playerOrder);
    }
    if (params.maxNumberOfPlayers !== undefined) {
      socket.data.controller.player.lobby.changeMaxNumberOfPlayers(
        params.maxNumberOfPlayers
      );
    }
  }

  @UseFilters(new OuistitiExceptionFilter('updatePlayer'))
  @SubscribeMessage('updatePlayer')
  updatePlayer(socket: Socket, params: PlayerUpdateParams) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    if (!params.id) {
      params.id = socket.data.controller.player.id;
    }
    if (params.id !== socket.data.controller.player.id) {
      OuistitiException.checkIfHost(socket.data.controller);
    }

    const player =
      socket.data.controller.player.lobby.getPlayerByIdAndThrowIfNotFound(
        params.id
      );
    if (params.nickname) {
      socket.data.controller.player.lobby.changePlayerNickname(
        player,
        params.nickname
      );
    }
    if (params.colour) {
      socket.data.controller.player.lobby.changePlayerColour(
        player,
        params.colour
      );
    }
    if (params.symbol) {
      player.changeSymbol(params.symbol);
    }
  }

  @UseFilters(new OuistitiExceptionFilter('randomisePlayerOrder'))
  @SubscribeMessage('randomisePlayerOrder')
  randomisePlayerOrder(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);

    socket.data.controller.player.lobby.changeOrder();
  }

  @UseFilters(new OuistitiExceptionFilter('kickPlayer'))
  @SubscribeMessage('kickPlayer')
  kickPlayer(socket: Socket, params: PlayerKickParams) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);
    if (params.id === socket.data.controller.player.id) {
      throw new OuistitiException({
        type: OuistitiErrorType.HOST_CANNOT_KICK_SELF,
      });
    }

    const player =
      socket.data.controller.player.lobby.getPlayerByIdAndThrowIfNotFound(
        params.id
      );
    socket.data.controller.player.lobby.removePlayer(player);
  }

  @UseFilters(new OuistitiExceptionFilter('startGame'))
  @SubscribeMessage('startGame')
  startGame(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);

    socket.data.controller.player.lobby.startGame({
      maxCardsPerPlayer: 8,
    });
  }

  @UseFilters(new OuistitiExceptionFilter('endGame'))
  @SubscribeMessage('endGame')
  endGame(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.endGame();
  }

  @UseFilters(new OuistitiExceptionFilter('suspendGame'))
  @SubscribeMessage('suspendGame')
  suspendGame(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.changeStatus(GameStatus.SUSPENDED);
  }

  @UseFilters(new OuistitiExceptionFilter('resumeGame'))
  @SubscribeMessage('resumeGame')
  resumeGame(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.changeStatus(
      GameStatus.IN_PROGRESS
    );
  }

  @UseFilters(new OuistitiExceptionFilter('placeBid'))
  @SubscribeMessage('placeBid')
  placeBid(socket: Socket, params: PlaceBidParams) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);
    OuistitiException.checkRequiredParams(params, ['bid']);

    socket.data.controller.player.lobby.game.currentRound.placeBid(
      socket.data.controller.player.id,
      params.bid
    );
  }

  @UseFilters(new OuistitiExceptionFilter('cancelBid'))
  @SubscribeMessage('cancelBid')
  cancelBid(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.currentRound.cancelBid(
      socket.data.controller.player.id
    );
  }

  @UseFilters(new OuistitiExceptionFilter('playCard'))
  @SubscribeMessage('playCard')
  playCard(socket: Socket, params: PlayCardParams) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkRequiredParams(params, ['id']);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.currentRound.playCard(
      socket.data.controller.player.id,
      params.id
    );
  }

  @UseFilters(new OuistitiExceptionFilter('acknowledgeBreakPoint'))
  @SubscribeMessage('acknowledgeBreakPoint')
  acknowledgeBreakPoint(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.currentRound.acknowledgeBreakPoint(
      socket.data.controller.player.id
    );
  }

  @UseFilters(new OuistitiExceptionFilter('getScores'))
  @SubscribeMessage('getScores')
  getScores(socket: Socket) {
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);

    socket.data.controller.emit(
      'scores',
      socket.data.controller.player.lobby.game.scores
    );
  }

  @UseFilters(new OuistitiExceptionFilter('skipRounds'))
  @SubscribeMessage('skipRounds')
  skipRounds(socket: Socket, params: SkipRoundsParams) {
    OuistitiException.checkRequiredParams(params, ['skipToRound']);
    OuistitiException.checkIfInLobby(socket.data.controller);
    OuistitiException.checkIfHost(socket.data.controller);
    OuistitiException.checkGameStarted(socket.data.controller.player.lobby);
    OuistitiException.checkIfNoVacancies(socket.data.controller.player.lobby);

    socket.data.controller.player.lobby.game.skipToRound(params.skipToRound);
  }
}
