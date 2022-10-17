import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import {
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
