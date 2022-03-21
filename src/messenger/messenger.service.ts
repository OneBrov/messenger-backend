import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from 'src/messages/messages.service';
import { DialogsService } from 'src/dialogs/dialogs.service';
import { FilesService } from 'src/files/files.service';
import { User } from 'src/users/users.entity';
import { WSClient } from './messenger.gateway';

@Injectable()
export class MessengerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly dialogsService: DialogsService,
    private readonly filesService: FilesService,
  ) {}
  async getUserFromSocket(socket: Socket) {
    const authenticationToken = socket.handshake.headers.authorization;
    const user = await this.usersService.getUserFromAuthenticationToken(
      authenticationToken,
    );
    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }

  async getContacts(userId: number, clients: WSClient[]) {
    const contacts = await this.dialogsService.getAllDialogs(userId);
    const dialogsData = await Promise.all(
      contacts.map(async ({ user, companion, lastReadMessageDate }) => {
        const lastMessage = await this.messagesService.getLastMessage(
          user.id,
          companion.id,
        );
        const unreadCount = await this.messagesService.getUnreadCount(
          user.id,
          companion.id,
          lastReadMessageDate,
        );
        const isOnline = clients.find((c) => c.userId === companion.id);
        return {
          companion,
          lastMessage,
          unreadCount,
          isOnline,
        };
      }),
    );

    return dialogsData;
  }

  async getDialogMessages(userId: number, companionId: number) {
    return await this.messagesService.getDialogMessages(userId, companionId);
  }

  async getDialogFiles(userId: number, companionId: number) {
    return await this.messagesService.getFilesFromDialogMessages(
      userId,
      companionId,
    );
  }

  async createDialog(userId: number, companionId: number) {
    return await this.dialogsService.createDialog(userId, companionId);
  }

  async createMessage(userId: number, companionId: number, message: string) {
    return await this.messagesService.createMessage({
      toId: companionId,
      fromId: userId,
      text: message,
    });
  }

  getUserIdBySocketId(clients: WSClient[], socketId: string) {
    return clients.find((c) => c.socketId === socketId)?.userId;
  }
}
