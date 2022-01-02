import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { PlayerService } from '../../services/player.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tmk-ouistiti-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent {
  showLobbySelector$ = this.playerService.currentPlayerInLobby$.pipe(
    map(inLobby => !inLobby)
  );

  constructor(private socketService: SocketService,
              private playerService: PlayerService) {
    this.socketService.connect();
  }
}
