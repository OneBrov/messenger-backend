import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { FilesService } from 'src/files/files.service';
import { UsersController } from 'src/users/users.controller';
import { MessagesController } from './messages.controller';
import { Message } from './messages.entity';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), FilesModule],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesModule],
})
export class MessagesModule {}
