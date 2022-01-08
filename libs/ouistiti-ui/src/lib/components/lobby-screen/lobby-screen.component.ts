import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { map } from 'rxjs/operators';
import { LobbyStatus, PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';
import { LobbyService } from '../../services/lobby.service';

@Component({
  selector: 'tmk-ouistiti-lobby-screen',
  templateUrl: './lobby-screen.component.html',
  styleUrls: ['./lobby-screen.component.scss']
})
export class LobbyScreenComponent {
  playerList$ = this.socketService.lobbyStatus$.pipe(
    map((status: LobbyStatus) => status?.lobby.playerOrder
      .map((playerId: string) => status.lobby.players
        .find((player: PlayerInfo) => player.id === playerId)
      )
    )
  );
  hostId$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.lobby.hostId));
  selfId$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.playerId));
  maxNumberOfPlayers$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.lobby.maxNumberOfPlayers));
  isHost$ = this.playerService.isHost$;

  constructor(private socketService: SocketService,
              private playerService: PlayerService,
              private lobbyService: LobbyService) {}

  onOrderChange(order: string[]) {
    this.lobbyService.changeCurrentLobbyOrder(order);
  }
}
