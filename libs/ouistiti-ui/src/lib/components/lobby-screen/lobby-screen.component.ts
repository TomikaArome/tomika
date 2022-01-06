import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { map } from 'rxjs/operators';
import { LobbyStatus } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'tmk-ouistiti-lobby-screen',
  templateUrl: './lobby-screen.component.html',
  styleUrls: ['./lobby-screen.component.scss']
})
export class LobbyScreenComponent {
  playerList$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.lobby.players));
  hostId$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.lobby.hostId));
  maxNumberOfPlayers$ = this.socketService.lobbyStatus$.pipe(map((status: LobbyStatus) => status?.lobby.maxNumberOfPlayers));
  isHost$ = this.playerService.isHost$;

  constructor(private socketService: SocketService,
              private playerService: PlayerService) {}
}
