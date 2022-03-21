import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthDto, RegistrationUserDto, UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/registration')
  async registration(@Body() dto: RegistrationUserDto) {
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
