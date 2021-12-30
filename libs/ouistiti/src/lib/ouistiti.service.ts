import { Injectable } from '@nestjs/common';
import { Lobby } from './classes/lobby.class';
import { Socket } from 'socket.io';
import { LobbyCreate, SocketStatus } from '@TomikaArome/ouistiti-shared';
import { Player } from './classes/player.class';

@Injectable()
export class OuistitiService {
  private lobbies: Lobby[] = [];
  private players: { [socketId: string]: Player } = {};

  getPlayerBySocketId(socketId: string): Player {
    return this.players[socketId] ?? null;
  }

  getLobbyByPlayerId(playerId: string): Lobby {
    return this.lobbies.find((lobby: Lobby) => {
      return lobby.players.findIndex((player: Player) => player.id === playerId) > -1;
    }) ?? null;
  }

  listLobbies(socket: Socket) {
    socket.emit('listLobbies', this.lobbies.map(lobby => lobby.getLobbyInfo()));
    // socket.emit('listLobbies', lobbyListMock);
  }

  createLobbyWithNewGame(hostSocket: Socket, params: LobbyCreate) {
    const newLobby = Lobby.createLobbyWithNewGame(hostSocket, params);
    this.lobbies.push(newLobby);
    this.players[hostSocket.id] = newLobby.host;

    const eventPayload: SocketStatus = {
      inLobby: true,
      lobby: newLobby.getLobbyInfo(),
      playerId: newLobby.host.id
    };
    newLobby.host.emit('socketStatus', eventPayload);
  }
}
