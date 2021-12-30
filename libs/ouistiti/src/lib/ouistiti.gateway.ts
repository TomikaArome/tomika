import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { OuistitiService } from './ouistiti.service';
import { LobbyCreate } from '@TomikaArome/ouistiti-shared';
import { UseFilters } from '@nestjs/common';
import { OuistitiExceptionFilter } from './ouistiti-exception.filter';

@WebSocketGateway({
  namespace: 'ouistiti',
  cors: {
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class OuistitiGateway implements OnGatewayConnection {
  constructor(private ouistitiService: OuistitiService) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
    this.ouistitiService.listLobbies(socket);
    socket.on('disconnect', (reason) => this.onDisconnect(socket, reason));
  }

  onDisconnect(socket: Socket, reason: string) {
    console.log(`Client disconnected: ${socket.id} Reason: ${reason}`);
  }

  @UseFilters(new OuistitiExceptionFilter('createLobby'))
  @SubscribeMessage('createLobby')
  createLobby(clientSocket: Socket, payload: LobbyCreate) {
    this.ouistitiService.createLobbyWithNewGame(clientSocket, payload);
  }
}
