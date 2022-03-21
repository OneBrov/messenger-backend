import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessengerService } from './messenger.service';

export interface WSClient {
  socketId: string;
  userId: number;
}

@WebSocketGateway()
export class MessengerGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  clients: WSClient[] = [];

  constructor(private readonly messengerService: MessengerService) {}

  async handleConnection(socket: Socket) {
    const user = await this.messengerService.getUserFromSocket(socket);

    this.clients.push({ socketId: socket.id, userId: user.id });
  }

  async handleDisconnect(socket: Socket) {
    this.clients.filter((c) => c.socketId !== socket.id);
  }

  @SubscribeMessage('send_message')
  listenForMessages(@MessageBody() data: string) {
    this.server.sockets.emit('receive_message', data);
  }
}
