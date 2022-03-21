import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { multerOptions } from './files.multer.config';
import { FilesService } from './files.service';

@Controller('/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('/file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file.fieldname);
    return await this.filesService.createFile(file);
  }

  @Post('/image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async createImage(@UploadedFile() image: Express.Multer.File) {
    return await this.filesService.createFile(image);
  }
}
