import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmk-ouistiti-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnDestroy {
  @Input()
  set timeLeft(timeInMs: number) {
    this.setInterval(+(new Date()) + timeInMs);
  };
  @Input()
  set timestamp(timestamp: number) {
    this.setInterval(timestamp);
  }
  @HostBinding('class.large')
  @Input()
  large = false;

  _timeLeft = 0;

  private endTimer$ = new Subject<void>();

  get minutes(): number {
    return Math.floor(this._timeLeft / 60000);
  }
  get seconds(): number {
    return Math.floor(Math.round(this._timeLeft / 100) / 10 % 60);
  }

  private setInterval(timestamp: number) {
    this.endTimer$.next();
    this.updateTimeLeft(timestamp);
    interval(1000).pipe(takeUntil(this.endTimer$)).subscribe(() => {
      this.updateTimeLeft(timestamp);
    });
  }

  private updateTimeLeft(timestamp: number) {
    const currTimestamp = +(new Date());
    this._timeLeft = Math.max(timestamp - currTimestamp, 0);
    if (this._timeLeft <= 0) {
      this.endTimer$.next();
    }
  }

  ngOnDestroy() {
    this.endTimer$.next();
    this.endTimer$.complete();

  }
}
