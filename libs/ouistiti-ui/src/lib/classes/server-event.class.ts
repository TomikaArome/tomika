import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

export class ServerEvent<T> {
  private eventSource: Subject<T>;
  readonly event$: Observable<T>;

  private _latestValue: T = null;
  get latestValue(): T {
    return this._latestValue;
  }

  constructor(readonly name: string, initialValue?: T) {
    if (initialValue) {
      this._latestValue = initialValue;
    }
    this.eventSource =
      initialValue === undefined
        ? new Subject<T>()
        : new BehaviorSubject<T>(initialValue);
    this.event$ = this.eventSource.asObservable();
  }

  bindSocket(socket: Socket) {
    socket.on(this.name, (payload: T) => {
      this._latestValue = payload;
      this.eventSource.next(payload);
    });
  }
}
