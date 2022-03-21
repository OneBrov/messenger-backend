import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/files/files.multer.config';
import { AuthDto, RegistrationUserDto, UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/registration')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async registration(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: RegistrationUserDto,
  ) {
    dto.image = image;
    console.log(dto);
    const token = await this.usersService.registration(dto);
    return token;
  }

  @Post('/login')
  async login(@Body() dto: AuthDto) {
    const token = await this.usersService.login(dto);
    return token;
  }
}
