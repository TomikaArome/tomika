import { Component } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'tmk-cards-test',
  templateUrl: './cards-test.component.html',
  styleUrls: ['./cards-test.component.scss']
})
export class CardsTestComponent {
  socket: Socket;

  connect() {
    console.log('Connect');
    this.socket = io('http://localhost:3333/ouistiti');
  }

  disconnect() {
    console.log('Disconnect');
    this.socket.disconnect();
  }
}
