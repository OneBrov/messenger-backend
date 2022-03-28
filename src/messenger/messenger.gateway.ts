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
    const onlineContactIds = await this.messengerService.getOnlineContacts(
      user.id,
      this.clients,
    );
    onlineContactIds.forEach((contactId) => {
      const socketId = this.messengerService.getSocketIdByUserId(
        this.clients,
        contactId,
      );
      this.server
        .to(socketId)
        .emit('receive_become_online', { userId: user.id });
    });
    this.clients.push({ socketId: socket.id, userId: user.id });
    console.log(`user ${user.tag} connected`);
    
  }

  async handleDisconnect(socket: Socket) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      socket.id,
    );
    const onlineContactIds = await this.messengerService.getOnlineContacts(
      userId,
      this.clients,
    );
    onlineContactIds.forEach((contactId) => {
      const socketId = this.messengerService.getSocketIdByUserId(
        this.clients,
        contactId,
      );
      this.server.to(socketId).emit('receive_become_offline', { userId });
    });
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

    const companionSocketId = this.messengerService.getSocketIdByUserId(
      this.clients,
      data.companionId,
    );

    if (companionSocketId) {
      this.server.to(companionSocketId).emit('receive_message', message);
    }
  }

  @SubscribeMessage('add_contact')
  async listenForContact(
    @MessageBody() data: { companionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.messengerService.getUserIdBySocketId(
      this.clients,
      client.id,
    );

    const newContact = await this.messengerService.createDialog(
      userId,
      data.companionId,
    );

    client.emit('receive_new_contact', newContact);
  }

  @SubscribeMessage('request_users_by_tag')
  async listenForUsers(
    @MessageBody() data: { tag: string },
    @ConnectedSocket() client: Socket,
  ) {
    const users = await this.messengerService.findUsersByTag(data.tag);

    client.emit('receive_users_by_tag', users);
  }
}
