import { nanoid } from 'nanoid'
import { Socket } from 'socket.io';

export class Player {
  id: string = 'ouistiti-player-' + nanoid();
  nickname = '';
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  isVacant(): boolean {
    return !this.socket?.connected;
  }
}
