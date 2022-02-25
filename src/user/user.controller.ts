import { Body, Controller, Logger, Res, Get, Param } from '@nestjs/common';
import { ResponseMessage } from '../utils/common/response.util2';
import { UserService } from './user.service';
import { Response } from 'src/utils/common/response.util';

@Controller('/user')
export class UserController {

  constructor(private readonly userService: UserService){}

  private setParmeterError(error: any) {
    Logger.error(error);
    return ResponseMessage(error);
  }

  @Get('/get-userprofile/id/:id')
  async getUserProfileProfileId(@Res() res: any, @Param('id') id: string) {
    const response: Response = await this.userService.getUserProfile({id});
    
    response.res(res).send();
  }

  @Get('/get-userprofile/penname/:penName')
  async getUserProfilePenName(@Res() res: any, @Param('penName') penName: string) {
    const response: Response = await this.userService.getUserProfile({penName});
    
    response.res(res).send();
  }

}