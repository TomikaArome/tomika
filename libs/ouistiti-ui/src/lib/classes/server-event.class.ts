import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import {
  lobbyStatusPlayerIsHostMock,
  roundStatusMock,
} from '@TomikaArome/ouistiti-shared';

export class ServerEvent<T> {
  private eventSource: Subject<T>;
  readonly event$: Observable<T>;

  constructor(readonly name: string, initialValue?: T) {
    this.eventSource =
      initialValue === undefined
        ? new Subject<T>()
        : new BehaviorSubject<T>(initialValue);
    this.event$ = this.eventSource.asObservable();
  }

  bindSocket(socket: Socket) {
    socket.on(this.name, (payload: T) => {
      this.eventSource.next(payload);
    });

    // Mock
    // switch (this.name) {
    //   case 'lobbyStatus': this.eventSource.next(lobbyStatusPlayerIsHostMock as any); break;
    //   case 'roundInfo': this.eventSource.next(roundStatusMock as any); break;
    // }
  }
}
