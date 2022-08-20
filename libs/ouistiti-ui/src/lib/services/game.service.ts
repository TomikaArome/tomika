import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { RoundScores, RoundStatus, RoundStatusChanged, roundStatusMock } from '@TomikaArome/ouistiti-shared';
import { BehaviorSubject } from 'rxjs';
import { getGameScoresMock } from '@TomikaArome/ouistiti-shared';

@Injectable({ providedIn: 'root' })
export class GameService {
  private currentGameScoresSource = new BehaviorSubject<RoundScores[]>(getGameScoresMock(roundStatusMock.playerOrder));
  currentGameScores$ = this.currentGameScoresSource.asObservable();

  constructor(private socketService: SocketService) {
    this.listenToEvents();
  }

  listenToEvents() {
    this.socketService.getEvent<RoundStatusChanged>('roundStatusChanged').subscribe((payload: RoundStatusChanged) => {
      console.log('ROUND STATUS CHANGED (game.sevice)', payload);
      if (payload.status === RoundStatus.COMPLETED) {
        this.currentGameScoresSource.next(payload.scores);
        console.log(payload.scores);
      }
    });
  }
}
