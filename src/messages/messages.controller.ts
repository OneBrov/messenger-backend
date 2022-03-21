import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { multerOptions } from 'src/files/files.multer.config';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';
import { myJWT } from 'src/users/users.service';
import { MessageDto, MessagesService } from './messages.service';

@Controller('/messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  async createMessage(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
    @Body() messageDto: MessageDto,
    @Req() req: any,
  ) {
    const user = req.user as myJWT;
    const file = files?.file?.at(0);
    const image = files?.image?.at(0);
    return await this.messagesService.createMessage(
      {
        ...messageDto,
        fromId: user.id,
      },
      image,
      file,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dialog/:companionId')
  async getDialogMessages(
    @Req() req: any,
    @Param('companionId')
    companionId: number,
  ) {
    const user = req.user as myJWT;
    console.log('aboba');
    return await this.messagesService.getDialogMessages(user.id, companionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dialog/lastMessage/:companionId')
  async getLastMessage(
    @Req() req: any,
    @Param('companionId')
    companionId: number,
  ) {
    const user = req.user as myJWT;
    const lastMessage = await this.messagesService.getLastMessage(
      user.id,
      companionId,
    );
    const unreadCount = await this.messagesService.getUnreadCount(
      user.id,
      companionId,
      '20-03-2022',
    );
    console.log(lastMessage, unreadCount);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/dialog/files/:companionId')
  async getFiles(
    @Req() req: any,
    @Param('companionId')
    companionId: number,
  ) {
    const user = req.user as myJWT;
    const files = await this.messagesService.getFilesFromDialogMessages(
      user.id,
      companionId,
    );
    console.log(files);
  }
}
