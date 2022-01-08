import { Injectable, PipeTransform } from '@nestjs/common';
import { SocketController } from './controllers/socket.controller';
import { Socket } from 'socket.io';

@Injectable()
export class SocketControllerPipe implements PipeTransform {
  private static socketControllers: { [socketId: string]: SocketController } = {};

  static registerController(socket: Socket): SocketController {
    const controller = new SocketController(socket);
    SocketControllerPipe.socketControllers[socket.id] = controller;
    controller.disconnected$.subscribe(() => {
      delete this.socketControllers[socket.id];
    });
    return controller;
  }

  static getSocketController(socket: Socket) {
    return SocketControllerPipe.socketControllers[socket.id] ?? null;
  }

  transform(value: unknown): unknown {
    if (value instanceof Socket) {
      value = SocketControllerPipe.socketControllers[value.id] ?? SocketControllerPipe.registerController(value);
    }
    return value;
  }
}
