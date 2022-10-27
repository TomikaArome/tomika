import { Component, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { map, takeUntil } from 'rxjs/operators';
import {
  LobbyStatus,
  MAX_NUMBER_OF_PLAYERS_PER_LOBBY,
  MIN_NUMBER_OF_PLAYERS_PER_LOBBY,
  PlayerColour,
  PlayerInfo,
  PlayerUpdateParams,
  RoundStatus,
} from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';
import { LobbyService } from '../../services/lobby.service';
import {
  faBan,
  faCrown,
  faDoorOpen,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { RoundService } from '../../services/round.service';

@Component({
  selector: 'tmk-ouistiti-lobby-screen',
  templateUrl: './lobby-screen.component.html',
  styleUrls: ['./lobby-screen.component.scss'],
})
export class LobbyScreenComponent implements OnDestroy {
  private onDestroy$ = new Subject<void>();

  playerList$ = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(
      map(
        (status: LobbyStatus) =>
          status?.lobby?.playerOrder?.map((playerId: string) =>
            status.lobby.players.find(
              (player: PlayerInfo) => player.id === playerId
            )
          ) ?? []
      )
    );
  hostId$ = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(map((status: LobbyStatus) => status?.lobby?.hostId ?? null));
  maxNumberOfPlayers$ = this.socketService
    .getEvent<LobbyStatus>('lobbyStatus')
    .pipe(
      map((status: LobbyStatus) => status?.lobby?.maxNumberOfPlayers ?? null)
    );

  takenColours$ = this.playerList$.pipe(
    map((players: PlayerInfo[]) =>
      players.map((player: PlayerInfo) => player.colour)
    )
  );
  takenNicknames$ = this.playerList$.pipe(
    map((players: PlayerInfo[]) =>
      players.map((player: PlayerInfo) => player.nickname)
    )
  );

  isHost = false;
  selfId = null;

  faCrown = faCrown;
  faBan = faBan;
  faDoorOpen = faDoorOpen;
  faPlay = faPlay;

  constructor(
    private socketService: SocketService,
    private playerService: PlayerService,
    private lobbyService: LobbyService,
    private roundService: RoundService
  ) {
    this.playerService.isHost$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((isHost: boolean) => {
        this.isHost = isHost;
      });
    this.socketService
      .getEvent<LobbyStatus>('lobbyStatus')
      .pipe(
        map((status: LobbyStatus) => status?.playerId),
        takeUntil(this.onDestroy$)
      )
      .subscribe((selfId: string) => {
        this.selfId = selfId;
      });
  }

  onOrderChange(order: string[]) {
    this.lobbyService.changeCurrentLobbyOrder(order);
  }

  onPlayerSettingsChanged(player: PlayerInfo, params: PlayerUpdateParams) {
    let shouldEmit = false;
    const paramsToEmit: PlayerUpdateParams = {
      id: player.id,
    };
    if (params.colour !== player.colour) {
      paramsToEmit.colour = params.colour;
      shouldEmit = true;
    }
    if (params.symbol !== player.symbol) {
      paramsToEmit.symbol = params.symbol;
      shouldEmit = true;
    }
    if (shouldEmit) {
      this.playerService.updatePlayerSettings(paramsToEmit);
    }
  }

  onNicknameUpdate(player: PlayerInfo, nickname: string) {
    this.playerService.updatePlayerSettings({
      id: player.id,
      nickname,
    });
  }

  omitColourFromTakenColours(
    colour: PlayerColour,
    taken: PlayerColour[]
  ): PlayerColour[] {
    const index = taken.indexOf(colour);
    if (index > -1) {
      const newArr = taken.slice();
      newArr.splice(index, 1);
      return newArr;
    }
  }

  onlyColourAndSymbol(player: PlayerInfo): PlayerUpdateParams {
    return {
      colour: player.colour,
      symbol: player.symbol,
    };
  }

  changeHost(newHostId: string) {
    this.lobbyService.changeCurrentLobbyHost(newHostId);
  }

  leaveLobbyOrKickPlayer(playerToKickId: string) {
    if (playerToKickId === this.selfId) {
      this.lobbyService.leaveLobby();
    } else {
      this.lobbyService.kickFromLobby({ id: playerToKickId });
    }
  }

  startGame() {
    this.lobbyService.startGame();
  }

  canStartGame(playerList: PlayerInfo[]): boolean {
    return (
      playerList.length >= MIN_NUMBER_OF_PLAYERS_PER_LOBBY &&
      playerList.length <= MAX_NUMBER_OF_PLAYERS_PER_LOBBY
    );
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
