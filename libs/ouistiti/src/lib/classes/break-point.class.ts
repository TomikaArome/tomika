import { merge, Subject, timer } from 'rxjs';
import { BreakPointMethod } from '../enums/break-point-method.enum';
import { takeUntil } from 'rxjs/operators';
import { BreakPointInfo } from '@TomikaArome/ouistiti-shared';

export type BreakPointSettings = {
  acknowledgements?: string[],
  duration?: number,
  bufferDuration?: number
}

export class BreakPoint {
  private resolvedSource = new Subject<BreakPointMethod>();
  private cancelledSource = new Subject<BreakPointMethod>();
  private timerResetSource = new Subject<number>();
  private acknowledgedSource = new Subject<string>();
  private acknowledgementCancelledSource = new Subject<string>();

  readonly resolved$ = this.resolvedSource.asObservable();
  readonly cancelled$ = this.cancelledSource.asObservable();
  readonly ended$ = merge(this.resolved$, this.cancelled$);
  readonly timerReset$ = this.timerResetSource.asObservable().pipe(takeUntil(this.ended$));
  readonly acknowledged$ = this.acknowledgedSource.asObservable().pipe(takeUntil(this.ended$));
  readonly acknowledgementCancelled$ = this.acknowledgementCancelledSource.asObservable().pipe(takeUntil(this.ended$));

  private acknowledgements: { [key: string]: boolean } = {};

  private _timestamp: number;
  get timestamp(): number { return this._timestamp; }

  private _resolved = false;
  get resolved(): boolean { return this._resolved; }
  private _cancelled = false;
  get cancelled(): boolean { return this._cancelled; }
  get ended(): boolean { return this.resolved || this.cancelled; }

  private bufferDuration = -1;
  private buffer: BreakPoint = null;

  private get allAcknowledged(): boolean {
    const values = Object.values(this.acknowledgements);
    return values.length > 0 && values.reduce((acc: boolean, curr: boolean) => acc && curr, true);
  }

  get info(): BreakPointInfo {
    const info: BreakPointInfo = {};
    if (this.timestamp > -1) { info.timerExpires = this.timestamp; }
    if (Object.keys(this.acknowledgements).length > 0) { info.acknowledgements = { ...this.acknowledgements }; }
    if (this.buffer) { info.buffer = this.buffer.info; }
    return info;
  }

  constructor(settings: BreakPointSettings) {
    if (settings.acknowledgements) {
      this.setAcknowledgements(settings.acknowledgements);
    }
    if (settings.duration) {
      this.setTimer(settings.duration);
    }
    this.bufferDuration = settings.bufferDuration ?? 0;
    this.ended$.subscribe(() => {
      this.buffer?.cancel();
    });
  }

  private resolve(method: BreakPointMethod) {
    if (!this.cancelled && !this.resolved) {
      this._resolved = true;
      this.resolvedSource.next(method);
      this.resolvedSource.complete();
      this.cancelledSource.complete();
    }
  }

  private cancelByMethod(method: BreakPointMethod) {
    this.cancelledSource.next(method);
    this.cancelledSource.complete();
    this.resolvedSource.complete();
    this._cancelled = true;
  }

  cancel() {
    if (!this.resolved && !this.cancelled) {
      this.cancelByMethod(BreakPointMethod.CANCELLED);
    }
  }

  bypass() {
    if (!this.resolved && !this.cancelled) {
      this.resolve(BreakPointMethod.BYPASSED);
    }
  }

  private acknowledgementIdExists(id: string): boolean {
    return Object.keys(this.acknowledgements).indexOf(id) > -1;
  }

  acknowledge(id: string) {
    if (!this.resolved && !this.cancelled && this.acknowledgementIdExists(id)) {
      this.acknowledgements[id] = true;
      if (this.allAcknowledged) {
        if (this.bufferDuration > 0) {
          let bufferDuration = this.bufferDuration;
          if (this.timestamp > -1) {
            bufferDuration = Math.min(bufferDuration, this.timestamp - +(new Date()));
          }
          this.buffer = new BreakPoint({
            duration: bufferDuration
          });
          this.buffer.resolved$.subscribe(() => {
            this.resolve(BreakPointMethod.RESOLVED);
          });
        } else {
          this.resolve(BreakPointMethod.RESOLVED);
        }
      }
      this.acknowledgedSource.next(id);
    }
  }

  cancelAcknowledgement(id: string) {
    if (!this.resolved && !this.cancelled && this.acknowledgementIdExists(id)) {
      this.acknowledgements[id] = false;
      this.buffer?.cancel();
      this.buffer = null;
      this.acknowledgementCancelledSource.next(id);
    }
  }

  setAcknowledgements(ids: string[]) {
    if (!this.resolved && !this.cancelled) {
      ids.forEach((id: string) => {
        if (!this.acknowledgementIdExists(id)) {
          this.acknowledgements[id] = false;
        }
      });
      Object.keys(this.acknowledgements).forEach((id: string) => {
        if (ids.indexOf(id) === -1) {
          delete this.acknowledgements[id];
        }
      });
    }
  }

  setTimer(durationInMs: number, cancelOnTimeout = false) {
    if (!this.resolved && !this.cancelled) {
      if (durationInMs > 0) {
        this._timestamp = +(new Date()) + durationInMs;
        this.timerResetSource.next(this._timestamp);
        timer(durationInMs).pipe(takeUntil(merge(this.ended$, this.timerReset$))).subscribe(() => {
          if (cancelOnTimeout) {
            this.cancelByMethod(BreakPointMethod.TIMEOUT);
          } else {
            this.resolve(BreakPointMethod.TIMEOUT);
          }
        });
      } else {
        this.cancelTimer();
      }
    }
  }

  cancelTimer() {
    if (!this.resolved && !this.cancelled) {
      this._timestamp = -1;
      this.timerResetSource.next(this._timestamp);
    }
  }
}
