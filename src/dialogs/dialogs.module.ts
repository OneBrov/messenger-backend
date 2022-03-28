import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/messages/messages.entity';
import { User } from 'src/users/users.entity';
import { DialogsController } from './dialogs.controller';
import { UserDialogs } from './dialogs.entity';
import { DialogsService } from './dialogs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDialogs]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Message]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [DialogsController],
  providers: [DialogsService],
  exports: [DialogsService],
})
export class DialogsModule {}
