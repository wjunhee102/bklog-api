import { Body, Controller, Logger, Post, Res, Get, Req } from '@nestjs/common';
import { ValidationError } from 'Joi';

import { ResponseMessage } from '../utils/common/response.util2';
import { UserService } from './user.service';
import { emailSchema } from './user.schema';
import { ValidationData } from 'src/types/validation';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { Response } from 'src/utils/common/response.util';

@Controller('/user')
export class UserController {

  constructor(private readonly userService: UserService){}

  private setParmeterError(error) {
    Logger.error(error);
    return ResponseMessage(error);
  }

  @Get('test')
  async getTest(@Res() res) {
    const userProfile: UserProfile = await this.userService.getUserProfile("4e17660a0ea99a83845cbf3c90f62700");

    new Response().body(userProfile).res(res).send();

  }

}