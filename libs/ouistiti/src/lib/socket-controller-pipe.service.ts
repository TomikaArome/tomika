import { Injectable, PipeTransform } from '@nestjs/common';
import { SocketController } from './controllers/socket.controller';
import { Socket } from 'socket.io';

@Injectable()
export class SocketControllerPipe implements PipeTransform {
  private static socketControllers: { [socketId: string]: SocketController } =
    {};

  static registerController(socket: Socket): SocketController {
    const controller = new SocketController(socket);
    SocketControllerPipe.socketControllers[socket.id] = controller;
    controller.stop$.subscribe(() => {
      // TODO move the socket controllers array to the SocketController class as a static property
      delete this.socketControllers[socket.id];
    });
    return controller;
  }

  static getSocketController(socket: Socket) {
    return SocketControllerPipe.socketControllers[socket.id] ?? null;
  }

  transform(value: unknown): unknown {
    if (
      value instanceof Socket ||
      (value && Object.getPrototypeOf(value)?.constructor?.name === 'Socket')
    ) {
      const socket = value as Socket;
      socket.data.controller =
        SocketControllerPipe.socketControllers[socket.id] ??
        SocketControllerPipe.registerController(socket);
    }
    return value;
  }
}
