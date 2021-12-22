import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameStatus, LobbyInfo } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['lobby-list.component.scss']
})
export class LobbyListComponent {
  listLobbies$ = this.socketService.listLobbies$;

  exampleItem: LobbyInfo = {
    passwordProtected: true,
    maxNumberOfPlayers: 4,
    gameStatus: GameStatus.INIT,
    playerNicknames: ['Thomas', 'Steve', 'Claire', 'David'],
    hostNickname: 'Thomas'
  }

  constructor(private socketService: SocketService) {
    this.listLobbies$.subscribe(payload => {
      console.log(payload);
    });
  }

  connect() {
    this.socketService.connect();
  }

  disconnect() {
    this.socketService.disconnect();
  }
}
