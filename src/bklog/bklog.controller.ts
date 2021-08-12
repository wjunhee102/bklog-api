import { Controller, Post, Req, Res, Body, Get, Param, Query } from '@nestjs/common';
import { BklogService } from './bklog.service';
import { ReqCreatePage } from './page/page.type';
import { AuthService } from 'src/auth/auth.service';
import { ACCESS_TOKEN, ResValitionAccessToken, REFRESH_TOKEN, TokenVailtionType } from 'src/auth/auth.type';
import { ResponseMessage } from 'src/utils/common/response.util2';
import { ParamGetPageList, ResTokenValidation } from './bklog.type';
import { Response, ResponseError, AuthErrorMessage } from 'src/utils/common/response.util';
import { ValidationData } from 'src/types/validation';
import { testSchema } from './bklog.shema';
import { throws } from 'assert';

@Controller('bklog')
export class BklogController {
  constructor( 
    private readonly authService: AuthService,
    private readonly bklogService: BklogService
  ){}

  private clearUserJwtCookie(res) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }

  private validationAccessToken(@Req() req): ResTokenValidation {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    const userAgent = req.headers["user-agent"];

    if(!accessToken) {
      return {
        id: null,
        accessToken: false
      }
    }

    // if(!accessToken) {
    //   return {
    //     uuid: "4e17660a0ea99a83845cbf3c90f62700"
    //   }
    // }

    return Object.assign({}, this.authService.validateAccessTokenReturnId(accessToken, userAgent), {
      accessToken: true
    });
  }

  private responseCheckToken({ infoFalse } : TokenVailtionType ,res): void {
    const response: Response = new Response();

    if(infoFalse) {
      this.clearUserJwtCookie(res);
      response.error(...AuthErrorMessage.info);
    } else {
      response.error(...AuthErrorMessage.exp);
    }

    response.res(res).send();
  }

  private async getPageList(
    res, 
    req, 
    factorGetPageList: ParamGetPageList
  ): Promise<void> {
    const { id, error, accessToken } = this.validationAccessToken(req);

    if(!id && accessToken) {
      this.responseCheckToken(error, res);
    } else {  
      const response = await this.bklogService.findPageList(factorGetPageList, id);

      response.res(res).send();
    }
    
  }

  @Get('list/penname/:penName')
  public async getPageListPenName(
    @Res() res,
    @Req() req, 
    @Param('penName') penName, 
    @Query('id') reqProfileId?, 
    @Query('skip') skip?, 
    @Query('take') take?
  ) {

    await this.getPageList(res, req, {
      pageUserInfo: {
        penName
      },
      reqProfileId,
      skip,
      take
    });

  }

  @Get('list/id/:profileId')
  public async getPageListProfileId(
    @Res() res,
    @Req() req, 
    @Param('profileId') id, 
    @Query('id') reqProfileId?,
    @Query('skip') skip?,
    @Query('take') take?
  ) {
    await this.getPageList(
      res,
      req, {
      pageUserInfo: {
        id
      },
      reqProfileId,
      skip,
      take
    })
  }

  @Post('create-page')
  public async createPage(
    @Req() req, 
    @Res() res,
    @Body() requiredBklogInfo: ReqCreatePage
  ) {

    const { id, error }  = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {

      const checkUser: boolean = await this.authService.checkUserIdNProfileId(
        id,
        requiredBklogInfo.profileId
      );

      if(!checkUser) {
        this.clearUserJwtCookie(res);

        new Response()
        .error(...AuthErrorMessage.info)
        .res(res)
        .send();

      } else {
        const response: Response = await this.bklogService.createBklog(
          Object.assign(requiredBklogInfo, { userId: id })
        );  
        
        response.res(res).send();
      }

    }
    
  }

  @Post('t-create-page')
  public async createPage2(
    @Res() res,
    @Body() requiredBklogInfo: ReqCreatePage
  ): Promise<void> {

    const checkUser: boolean = await this.authService.checkUserIdNProfileId(
      "4d120c098d6a113ebe55c5cfa43beb4a",
      requiredBklogInfo.profileId
    );

    if(!checkUser) {
      this.clearUserJwtCookie(res);

      new Response().error(...AuthErrorMessage.info).res(res).send();
        
    } else {
      const response: Response = await this.bklogService.createBklog(
        Object.assign( requiredBklogInfo, { userId: "4d120c098d6a113ebe55c5cfa43beb4a" })
      );  
      
      response.res(res).send();
    }
    
  }

  @Get('getpage')
  public async getPage(@Res() res, @Req() req, @Query('id') pageId): Promise<void> {
    const { id, error, accessToken } = this.validationAccessToken(req);

    if(!id && accessToken) {
      this.responseCheckToken(error, res);
    } else {
      const response: Response = await this.bklogService.getPage(pageId, id); 
      response.res(res).send();
    }
    
  }

  @Get('t-getpage')
  public async testGetPage(@Res() res, @Req() req, @Query('id') pageId) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    if(accessToken) {
      const resCheckCookie = this.validationAccessToken(req);

      if(!resCheckCookie.id) {
        this.responseCheckToken(resCheckCookie.error, res);
      } else {
        const response: Response = await this.bklogService.getPage(pageId, "4e17660a0ea99a83845cbf3c90f62700"); 
        response.res(res).send();
      }
    } else {
      const response: Response = await this.bklogService.getPage(pageId, "4e17660a0ea99a83845cbf3c90f62700"); 
      response.res(res).send();
    }

  }

  @Get('release-updating/:pageId')
  public async releaseUpdating(@Req() req, @Res() res, @Param('pageId') pageId: string) {
    const resCheckCookie = this.validationAccessToken(req);

    if(!resCheckCookie.id) {

      new Response()
      .error(...AuthErrorMessage.info)
      .res(res)
      .send();
    } else {

      // 후에 page module로 이동
      const response: Response = await this.bklogService.releaseUpdating(resCheckCookie.id, pageId);

      response.res(res).send();
    }
  }

  @Post('modify')
  public async modifyBlock(@Req() req, @Body() data: any, @Res() res) {
    const resCheckCookie = this.validationAccessToken(req);

    if(!resCheckCookie.id) {

      new Response()
      .error(...AuthErrorMessage.info)
      .res(res)
      .send();
    } else {
      const response: Response = await this.bklogService.modifyBlock(
        data.data, 
        data.pageId, 
        resCheckCookie.id, 
        data.pageVersions
      );
  
      response.res(res).send();
    }
  }

  @Get('getmodifydata')
  public async getModifyData(@Res() res, @Query("id") id, @Query("preId") preId) {
    const response: Response = await this.bklogService.getModifyData(id, preId);

    response.res(res).send();
  }

  @Post('t-modify')
  public async testModifyBlock(@Res() res, @Body() data: any) {
    const response: Response = await this.bklogService.modifyBlock(
      data.data, 
      data.pageId, 
      "4d120c098d6a113ebe55c5cfa43beb4a", 
      data.pageVersions
    );

    response.res(res).send();
  }

  @Get('test')
  public async test(@Query('data') data: string, @Query('data2') data2?: string){
    // const { value, error }: ValidationData<any> = testSchema.validate({data, data2});
    // console.log(value, error);
    const res = await this.bklogService.addTest(data);

    return ResponseMessage(res);
  }

  @Get('test2')
  public test2(@Query('data') data, @Res() res){
    this.bklogService.addTest2(data)
    .then((response) => response
      .error(
        new ResponseError()
        .build("test", "test", "500", "test")
        .get()
      )
      .res(res)
      .send()
    )
  
  }

  @Get('test-d')
  public async deleteTest(@Query('id') id, @Res() response) {
    const res = await this.bklogService.deleteTest(id);
    response.status(404).send(ResponseMessage(res));
  }

}
