import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { GameStatus, LobbyInfo, PlayerColour, PlayerSymbol } from '@TomikaArome/ouistiti-shared';

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
    gameStatus: GameStatus.IN_PROGRESS,
    players: [
      {
        id: 'AXP9aX7pRuHZH1a1Bi_Sf',
        nickname: 'Thomas',
        colour: PlayerColour.AQUA,
        symbol: PlayerSymbol.SPADE
      },
      {
        id: 'So5DdHmXOR7YoDnDeMBPC',
        nickname: 'Steve',
        colour: PlayerColour.RED,
        symbol: PlayerSymbol.CLUB
      },
      {
        id: '5x89SitQIGwno_mUWhqG6',
        nickname: 'Claire',
        colour: PlayerColour.GREEN,
        symbol: PlayerSymbol.DIAMOND
      },
      {
        id: 'ne6NF08aL2caTuk3c34rX',
        nickname: 'David',
        colour: PlayerColour.BLUE,
        symbol: PlayerSymbol.SPADE
      }
    ],
    hostId: 'AXP9aX7pRuHZH1a1Bi_Sf'
  }

  constructor(private socketService: SocketService) {
    this.listLobbies$.subscribe(payload => {
      //console.log(payload);
    });
  }

  connect() {
    this.socketService.connect();
  }

  disconnect() {
    this.socketService.disconnect();
  }
}
