import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesService } from 'src/files/files.service';
import { Repository } from 'typeorm';
import { Message } from './messages.entity';

export interface MessageDto {
  fromId: number;
  toId: number;
  text: string;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private filesService: FilesService,
  ) {}
  async createMessage(
    dto: MessageDto,
    image?: Express.Multer.File,
    file?: Express.Multer.File,
  ) {
    const dbMessage = new Message();
    dbMessage.from = <any>dto.fromId;
    dbMessage.to = <any>dto.toId;
    dbMessage.text = dto.text;
    if (image) {
      const dbImage = await this.filesService.createImage(image);
      dbMessage.image = dbImage;
    }
    if (file) {
      const dbFile = await this.filesService.createFile(file);
      dbMessage.file = dbFile;
    }
    const savedMessage = await this.messagesRepository.save(dbMessage);
    console.log(savedMessage);
    return savedMessage;
  }

  async getDialogMessages(userId: number, companionId: number) {
    const dialogMessages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.from', 'from')
      .leftJoinAndSelect('message.to', 'user')
      .leftJoinAndSelect('message.image', 'image')
      .leftJoinAndSelect('message.file', 'file')
      .where('message.from = :userId and message.to = :companionId', {
        userId,
        companionId,
      })
      .orWhere('message.from = :companionId and message.to = :userId', {
        companionId,
        userId,
      })
      .orderBy('message.sendingDate')
      .getMany();

    console.log(dialogMessages);

    return dialogMessages;
  }

  async getFilesFromDialogMessages(userId: number, companionId: number) {
    const files = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.image', 'image')
      .leftJoinAndSelect('message.file', 'file')
      .select(['message.id'])
      .addSelect([
        'image.id',
        'image.fileName',
        'image.size',
        'image.src',
        'image.type',
      ])
      .addSelect([
        'file.id',
        'file.fileName',
        'file.size',
        'file.src',
        'file.type',
      ])
      .where('message.from = :userId and message.to = :companionId', {
        userId,
        companionId,
      })
      .orWhere('message.from = :companionId and message.to = :userId', {
        companionId,
        userId,
      })
      .orderBy('message.sendingDate', 'DESC')
      .getMany();
    return files;
  }

  async getLastMessage(userId: number, companionId: number) {
    const lastMessage = await this.messagesRepository
      .createQueryBuilder('message')
      .where('message.from = :userId and message.to = :companionId', {
        userId,
        companionId,
      })
      .orWhere('message.from = :companionId and message.to = :userId', {
        companionId,
        userId,
      })
      .orderBy('message.sendingDate', 'DESC')
      .limit(1)
      .getOne();
    return lastMessage;
  }

  async getUnreadCount(
    userId: number,
    companionId: number,
    lastReadDate: Date | string,
  ) {
    const unreadCount = await this.messagesRepository
      .createQueryBuilder('message')
      .where(
        'message.from = :userId and message.to = :companionId and message.sendingDate > :lastReadDate',
        {
          userId,
          companionId,
          lastReadDate,
        },
      )
      .orWhere(
        'message.from = :companionId and message.to = :userId  and message.sendingDate > :lastReadDate',
        {
          companionId,
          userId,
          lastReadDate,
        },
      )
      .orderBy('message.sendingDate', 'DESC')
      .getCount();
    return unreadCount;
  }
}
