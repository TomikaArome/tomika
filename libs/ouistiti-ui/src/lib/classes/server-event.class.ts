import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

export class ServerEvent<T> {
  private eventSource: Subject<T>;
  readonly event$: Observable<T>;

  constructor(readonly name: string, initialValue?: T) {
    this.eventSource = (initialValue === undefined ? new Subject<T>() : new BehaviorSubject<T>(initialValue))
    this.event$ = this.eventSource.asObservable();
  }

  bindSocket(socket: Socket) {
    socket.on(this.name, (payload: T) => {
      this.eventSource.next(payload);
    });
  }
}
