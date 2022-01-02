import { Injectable } from '@nestjs/common';
import { Lobby } from './classes/lobby.class';
import { Socket } from 'socket.io';
import { LobbyCreate, LobbyJoin, LobbyStatus, OuistitiErrorType } from '@TomikaArome/ouistiti-shared';
import { Player } from './classes/player.class';
import { OuistitiException } from './classes/ouistiti-exception.class';

@Injectable()
export class OuistitiService {
  private lobbies: Lobby[] = [];
  private players: { [socketId: string]: Player } = {};

  getPlayerBySocketId(socketId: string): Player {
    return this.players[socketId] ?? null;
  }

  getLobbyById(lobbyId: string): Lobby {
    const lobby = this.lobbies.find((lobby: Lobby) => lobby.id === lobbyId);
    if (!lobby) {
      throw new OuistitiException({
        type: OuistitiErrorType.INVALID_ID,
        param: 'id',
        detail: {
          provided: lobbyId
        }
      });
    }
    return lobby;
  }

  getLobbyByPlayerId(playerId: string): Lobby {
    return this.lobbies.find((lobby: Lobby) => {
      return lobby.players.findIndex((player: Player) => player.id === playerId) > -1;
    }) ?? null;
  }

  listLobbies(socket: Socket) {
    socket.emit('listLobbies', this.lobbies.map(lobby => lobby.info));
    // socket.emit('listLobbies', lobbyListMock);
  }

  createLobbyWithNewGame(hostSocket: Socket, params: LobbyCreate) {
    const newLobby = Lobby.createLobbyWithNewGame(hostSocket, params);
    this.lobbies.push(newLobby);
    this.players[hostSocket.id] = newLobby.host;

    const eventPayload: LobbyStatus = {
      inLobby: true,
      lobby: newLobby.info,
      playerId: newLobby.host.id
    };
    newLobby.host.emit('lobbyStatus', eventPayload);
  }

  joinLobby(clientSocket: Socket, params: LobbyJoin) {
    OuistitiException.checkRequiredParams(params, ['id']);
    this.players[clientSocket.id] = this.getLobbyById(params.id).addPlayer(clientSocket, params);
  }
}
