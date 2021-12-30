import { OuistitiException } from './classes/ouistiti-exception.class';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch(OuistitiException)
export class OuistitiExceptionFilter implements ExceptionFilter {
  caller: string;

  constructor(caller: string) {
    this.caller = caller;
  }


  catch(exception: OuistitiException, host: ArgumentsHost) {
    const socket: Socket = host.switchToWs().getClient();
    socket.emit('error', {
      caller: this.caller,
      ...exception.getError()
    });
  }
}
