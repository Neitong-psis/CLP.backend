import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { sendResponseSuccess } from './utils/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    return sendResponseSuccess(res, { message: this.appService.getHello() });
  }

  @Get('health')
  getHealth(@Res() res: Response) {
    return sendResponseSuccess(res, this.appService.getHealth());
  }
}
