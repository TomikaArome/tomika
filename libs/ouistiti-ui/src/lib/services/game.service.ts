import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class GameService {


  constructor(socketService: SocketService) {
    this.listenToEvents();
  }

  listenToEvents() {

  }
}
