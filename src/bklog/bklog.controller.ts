import { Controller, Post, Req, Res, Body, Get, Param, Query } from '@nestjs/common';
import { BklogService } from './bklog.service';
import { ReqCreatePage } from './page/page.type';
import { AuthService } from 'src/auth/auth.service';
import { ACCESS_TOKEN, ResValitionAccessToken } from 'src/auth/auth.type';
import { ResponseMessage } from 'src/utils/base/response.util';
import { ParamGetPageList, ResModifyBlock, ResCreateBklog } from './bklog.type';

@Controller('bklog')
export class BklogController {
  constructor( 
    private readonly authService: AuthService,
    private readonly bklogService: BklogService
  ){}

  private validationAccessToken(@Req() req): ResValitionAccessToken {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    const userAgent = req.headers["user-agent"];

    if(!accessToken) {
      return {
        uuid: null,
        error: {
          infoFalse: true,
          expFalse: false
        }
      }
    }

    return this.authService.validateAccessTokenReturnId(accessToken, userAgent);
  }

  private responseReissueToken(error) {
    return ResponseMessage({ success: false, error });
  }

  private async getPageList(req, factorGetPageList: ParamGetPageList) {
    const resCheckCookie = this.validationAccessToken(req);

    if(!resCheckCookie.error.infoFalse) {
      if(!resCheckCookie.uuid) {
        return this.responseReissueToken(resCheckCookie.error);
      }
    } 

    const pageInfoList = await this.bklogService.findPageList(factorGetPageList);

    return ResponseMessage(pageInfoList);
  }

  @Get('list/penname/:penName')
  async getPageListPenName(@Req() req, @Param('penName') penName, @Query('id') reqUserId) {

    return await this.getPageList(req, {
      pageUserInfo: {
        penName
      },
      reqUserId
    });
  }

  @Get('list/id/:profileId')
  async getPageListProfileId(@Req() req, @Param('profileId') id, @Query('id') reqUserId) {
    return await this.getPageList(req, {
      pageUserInfo: {
        id
      },
      reqUserId
    })
  }

  @Post('create-page')
  public async createPage(
    @Req() req, 
    @Body() requiredBklogInfo: ReqCreatePage
  ) {

    const resCheckCookie = this.validationAccessToken(req);

    if(!resCheckCookie.uuid) {
      return this.responseReissueToken(resCheckCookie.error);
    } 

    const resCreateBklog: ResCreateBklog = await this.bklogService.createBklog(
      Object.assign(
        requiredBklogInfo, {
          userId: resCheckCookie.uuid
    }));  
    
    return ResponseMessage(resCreateBklog);
  }

  @Get('getpage')
  public async getPage(@Req() req, @Query('id') id) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    let resCheckCookie = undefined;

    if(accessToken) {
      resCheckCookie = this.validationAccessToken(req);

      if(!resCheckCookie.uuid) {
        return this.responseReissueToken(resCheckCookie.error);
      }
    } 

    const page: any = await this.bklogService.getPage(id, resCheckCookie? resCheckCookie.uuid : undefined); 

    return ResponseMessage({
      success: true,
      page
    });
  }

  @Get('t-getpage')
  public async testGetPage(@Req() req, @Query('id') id) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    if(accessToken) {
      const resCheckCookie = this.validationAccessToken(req);

      if(!resCheckCookie.uuid) {
        return this.responseReissueToken(resCheckCookie.error);
      }
    } 

    const page: any = await this.bklogService.getPage(id,  "4087b8662b988ca2a405c9a6030703a0"); 

    return ResponseMessage({
      success: true,
      page
    });
  }

  @Post('modify')
  public async modifyBlock(@Req() req, @Body() data: any) {
    const resCheckCookie = this.validationAccessToken(req);

    if(!resCheckCookie.uuid) {
      return this.responseReissueToken(resCheckCookie.error);
    } 

    const res: ResModifyBlock = await this.bklogService.modifyBlock(
      data.data, 
      data.pageId, 
      resCheckCookie.uuid, 
      data.pageVersions
    );
    
    return ResponseMessage(res);
  }

  @Post('t-modify')
  public async testModifyBlock(@Body() data: any) {

    const res: ResModifyBlock = await this.bklogService.modifyBlock(data.data, data.pageId, "4087b8662b988ca2a405c9a6030703a0", data.pageVersions);
    
    return ResponseMessage(res);
  }

}
