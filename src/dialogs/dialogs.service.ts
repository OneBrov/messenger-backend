import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/messages/messages.entity';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { UserDialogs } from './dialogs.entity';

@Injectable()
export class DialogsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserDialogs)
    private userDialogsRepository: Repository<UserDialogs>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getAllDialogs(userId: number) {
    const user = await this.userDialogsRepository
      .createQueryBuilder('dialog')
      .leftJoinAndSelect('dialog.user', 'user')
      .leftJoinAndSelect('dialog.companion', 'companion')
      .where('user.id =:userId', { userId })
      .getMany();

    return user;
  }

  async createDialog(userId: number, companionId: number) {
    const now = new Date();

    const user = await this.usersRepository.findOne({ id: userId });
    const companion = await this.usersRepository.findOne({ id: companionId });
    const myDialog = new UserDialogs();
    myDialog.companion = companion;
    myDialog.user = user;
    myDialog.lastReadMessageDate = now;
    await this.userDialogsRepository.save(myDialog);

    const companionDialog = new UserDialogs();
    companionDialog.companion = user;
    companionDialog.user = companion;
    companionDialog.lastReadMessageDate = now;
    await this.userDialogsRepository.save(companionDialog);

    return user;
  }
}
