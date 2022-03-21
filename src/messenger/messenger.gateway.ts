import {
  ConnectedSocket,
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

  @SubscribeMessage('request_contacts')
  async listenForGetContacts(@ConnectedSocket() client: Socket) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      client.id,
    );
    const contacts = await this.messengerService.getContacts(
      userId,
      this.clients,
    );
    client.emit('receive_initial_dialogs', contacts);
  }

  @SubscribeMessage('request_dialog_messages')
  async listenForGetMessages(
    @MessageBody() data: { companionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      client.id,
    );
    const messages = await this.messengerService.getDialogMessages(
      userId,
      data.companionId,
    );
    client.emit('receive_dialog_messages', messages);
  }

  @SubscribeMessage('request_dialog_files')
  async listenForGetFiles(
    @MessageBody() data: { companionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      client.id,
    );

    const files = await this.messengerService.getDialogFiles(
      userId,
      data.companionId,
    );

    client.emit('receive_files', files);
  }

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() data: { companionId: number; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      client.id,
    );
    const message = await this.messengerService.createMessage(
      userId,
      data.companionId,
      data.text,
    );

    //Здесь должна быть реализация отправки сообщения компаньону
    // client.emit('receive_message', data);
  }

  @SubscribeMessage('add_contact')
  listenForContact(
    @MessageBody() data: { companionId: number },
    @ConnectedSocket() client: Socket,
  ) {

    this.server.sockets.emit('receive_new_contact', data);
  }
}
