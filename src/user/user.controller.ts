import { Body, Controller, Logger, Post, Res, Get, Req, Param } from '@nestjs/common';

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

  @Get('/get-userprofile/id/:id')
  async getUserProfileProfileId(@Res() res, @Param('id') id: string) {
    const response: Response = await this.userService.getUserProfile({id});
    
    response.res(res).send();
  }

  @Get('/get-userprofile/penname/:penName')
  async getUserProfilePenName(@Res() res, @Param('penName') penName: string) {
    const response: Response = await this.userService.getUserProfile({penName});
    
    response.res(res).send();
  }

}