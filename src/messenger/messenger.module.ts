import { Module } from '@nestjs/common';
import { DialogsModule } from 'src/dialogs/dialogs.module';
import { FilesModule } from 'src/files/files.module';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { MessengerGateway } from './messenger.gateway';
import { MessengerService } from './messenger.service';

@Module({
  providers: [MessengerGateway, MessengerService],
  imports: [UsersModule, DialogsModule, FilesModule, MessagesModule],
})
export class MessengerModule {}
