import { Body, Controller, Logger, Post, Res, Get, Req } from '@nestjs/common';
import { ValidationError } from 'Joi';

import { ResponseMessage } from '../utils/base/response.util';
import { UserService } from './user.service';
import { emailSchema } from './user.schema';
import { ValidationData } from 'src/types/validation';

@Controller('/user')
export class UserController {

  constructor(private readonly userService: UserService){}

  private setParmeterError(error) {
    Logger.error(error);
    return ResponseMessage(error);
  }

}