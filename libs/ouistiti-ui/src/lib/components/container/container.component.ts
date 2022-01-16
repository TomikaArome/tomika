import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { PlayerService } from '../../services/player.service';
import { map } from 'rxjs/operators';
import { LobbyService } from '../../services/lobby.service';
import { GameStatus, LobbyInfo } from '@TomikaArome/ouistiti-shared';
import { RoundService } from '../../services/round.service';

@Component({
  selector: 'tmk-ouistiti-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {
  showLobbySelector$ = this.playerService.currentPlayerInLobby$.pipe(
    map((inLobby: boolean) => !inLobby)
  );

  showLobbyScreen$ = this.lobbyService.currentLobby$.pipe(
    map((lobby: LobbyInfo) => lobby.gameStatus === GameStatus.INIT)
  );

  roundStatus$ = this.roundService.roundStatus$;

  constructor(private socketService: SocketService,
              private playerService: PlayerService,
              private lobbyService: LobbyService,
              private roundService: RoundService) {
    this.socketService.connect();
  }
}
