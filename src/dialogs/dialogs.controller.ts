import { Controller, Get, Param } from '@nestjs/common';
import { DialogsService } from './dialogs.service';

@Controller()
export class DialogsController {
  constructor(private readonly dialogsService: DialogsService) {}
  @Get('/dialogs')
  async getUserDialogs(@Param() userId: number) {
    const token = await this.dialogsService.getAllDialogs(userId);
    return token;
  }
}
