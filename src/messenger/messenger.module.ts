import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { MessengerGateway } from './messenger.gateway';
import { MessengerService } from './messenger.service';

@Module({
  providers: [MessengerGateway, MessengerService],
  imports: [UsersService],
})
export class MessengerModule {}
