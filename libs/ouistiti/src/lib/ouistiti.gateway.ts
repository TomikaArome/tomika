import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { LobbyCreateParams, LobbyJoinParams } from '@TomikaArome/ouistiti-shared';
import { UseFilters } from '@nestjs/common';
import { OuistitiExceptionFilter } from './ouistiti-exception.filter';
import { SocketController } from './controllers/socket.controller';
import { OuistitiException } from './classes/ouistiti-exception.class';
import { Lobby } from './classes/lobby.class';
import { Player } from './classes/player.class';

@WebSocketGateway({
  namespace: 'ouistiti',
  cors: {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class OuistitiGateway implements OnGatewayConnection {
  private socketControllers: { [socketId: string]: SocketController } = {};

  getSocketController(socket: Socket) {
    return this.socketControllers[socket.id] ?? null;
  }

  handleConnection(socket: Socket) {
    const controller = new SocketController(socket);
    this.socketControllers[socket.id] = controller;
    controller.disconnected$.subscribe(() => {
      delete this.socketControllers[socket.id];
    });
  }

  @UseFilters(new OuistitiExceptionFilter('listLobbies'))
  @SubscribeMessage('listLobbies')
  listLobbies(clientSocket: Socket) {
    this.getSocketController(clientSocket)?.emitLobbyList();
  }

  @UseFilters(new OuistitiExceptionFilter('createLobby'))
  @SubscribeMessage('createLobby')
  createLobby(clientSocket: Socket, params: LobbyCreateParams) {
    OuistitiException.checkRequiredParams(params, ['host.nickname']);
    Lobby.createLobbyWithNewGame(params, (player: Player) => {
      this.getSocketController(clientSocket).player = player;
    });
  }

  @UseFilters(new OuistitiExceptionFilter('joinLobby'))
  @SubscribeMessage('joinLobby')
  joinLobby(clientSocket: Socket, params: LobbyJoinParams) {
    OuistitiException.checkRequiredParams(params, ['id', 'player.nickname']);
    Lobby.getLobbyById(params.id).addPlayer(params, (player: Player) => {
      this.getSocketController(clientSocket).player = player;
    });
  }
}
