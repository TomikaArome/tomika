import { Injectable } from '@nestjs/common';
import { Lobby, CreateLobbySettings } from './classes/Lobby.class';
import { Socket, Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';
import { lobbyListMock } from '@TomikaArome/ouistiti-shared';

@Injectable()
export class OuistitiService {
  @WebSocketServer()
  server: Server;

  lobbies: Lobby[] = [];

  listLobbies(socket: Socket) {
    //socket.emit('listLobbies', this.lobbies.map(lobby => lobby.getLobbyInfo()));
    socket.emit('listLobbies', lobbyListMock);
  }

  createLobbyWithNewGame(hostSocket: Socket, settings: CreateLobbySettings) {
    this.lobbies.push(Lobby.createLobbyWithNewGame(hostSocket, settings));
  }
}
