import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import {
  PlayerScore,
  RoundScores,
  RoundStatus,
  RoundStatusChanged
} from '@TomikaArome/ouistiti-shared';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private currentGameScoresSource = new BehaviorSubject<RoundScores[]>(
    this.socketService.getServerEvent<RoundScores[]>('scores').latestValue);
  currentGameScores$ = this.currentGameScoresSource.asObservable();

  static getCumulativeScores(scores: RoundScores[], roundNumber: number): { [playerId: string]: number } {
    return scores.reduce((cumulativeScores: { [playerId: string]: number }, roundScores: RoundScores) => {
      if (!roundScores.playerScores || roundScores.roundNumber > roundNumber) {
        return cumulativeScores;
      }
      roundScores.playerScores.forEach((playerScore: PlayerScore) => {
        if (typeof cumulativeScores[playerScore.playerId] !== 'number') {
          cumulativeScores[playerScore.playerId] = 0;
        }
        cumulativeScores[playerScore.playerId] += playerScore.pointDifference;
      });
      return cumulativeScores;
    }, {});
  }

  constructor(private socketService: SocketService) {
    this.listenToEvents();
  }

  listenToEvents() {
    this.socketService
      .getEvent<RoundStatusChanged>('roundStatusChanged')
      .subscribe((payload: RoundStatusChanged) => {
        if (payload.status === RoundStatus.COMPLETED) {
          this.currentGameScoresSource.next(payload.scores);
        }
      });

    this.socketService
      .getEvent<RoundScores[]>('scores')
      .subscribe((payload: RoundScores[]) => {
        this.currentGameScoresSource.next(payload);
      });
  }

  getScores() {
    this.socketService.emitEvent('getScores');
  }
}
