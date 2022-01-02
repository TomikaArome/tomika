import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'tmk-ouistiti-lobby-screen',
  templateUrl: './lobby-screen.component.html',
  styleUrls: ['./lobby-screen.component.scss']
})
export class LobbyScreenComponent {
  lobbyStatus$ = this.socketService.lobbyStatus$;

  constructor(private socketService: SocketService) {}
}
