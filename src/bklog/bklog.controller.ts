import { Controller, Post, Req, Res, Body, Get, Param, Query } from '@nestjs/common';
import { BklogService } from './bklog.service';
import { RequiredPageInfo } from './page/page.type';
import { AuthService } from 'src/auth/auth.service';
import { ACCESS_TOKEN } from 'src/auth/auth.type';
import { ResponseMessage } from 'src/util/response.util';

@Controller('bklog')
export class BklogController {
  constructor( 
    private readonly authService: AuthService,
    private readonly bklogService: BklogService
  ){}

  private validationAccessToken(@Req() req) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    const userAgent = req.headers["user-agent"];

    return this.authService.validationAccessToken(accessToken, userAgent);
  }

  private responseReissueToken(resCheckCookie) {
    return ResponseMessage({ success: false, resCheckCookie});
  }

  @Get('list/:penName')
  async getPageList(@Req() req, @Param('penName') penName, @Query('id') id) {
    const resCheckCookie = this.validationAccessToken(req);

    if(resCheckCookie) {
      return this.responseReissueToken(resCheckCookie);
    }

    

    return "success"
  }

  @Post('create-page')
  public async createPage(
    @Req() req, 
    @Body() requiredPageInfo: RequiredPageInfo
  ) {

    const resCheckCookie = this.validationAccessToken(req);

    if(resCheckCookie) {
      return this.responseReissueToken(resCheckCookie);
    } 
    const pageId = await this.bklogService.createBklog(requiredPageInfo);
    
    return ResponseMessage({
      success: true,
      pageId
    });
  }

}
