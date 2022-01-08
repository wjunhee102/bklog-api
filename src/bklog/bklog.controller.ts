import { Controller, Post, Req, Res, Body, Get, Param, Query, ParseIntPipe, UsePipes, Delete } from '@nestjs/common';
import { BklogService } from './bklog.service';
import { ReqCreatePage } from './page/page.type';
import { AuthService } from 'src/auth/auth.service';
import { ACCESS_TOKEN } from 'src/auth/auth.type';
import { ParamGetPageList, ReqDeletePage, ReqEditPageEditor, ReqUpdateBklog, ReqUpdatePageInfo } from './bklog.type';
import { Response, AuthErrorMessage } from 'src/utils/common/response.util';
import { reqCreatePageSchema, reqDeletePageSchema, reqEditPageEditorSchema, reqUpdateBklogSchema, reqUpdatePageInfoSchema } from './dto/bklog.shema';
import { JoiValidationPipe } from 'src/pipes/joi-validation.pipe';
import { BaseController } from 'src/common/base.controller';

@Controller('bklog')
export class BklogController extends BaseController {
  constructor( 
    authService: AuthService,
    private readonly bklogService: BklogService
  ){ super(authService) }

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
    @Param('penName') penName: string, 
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

  // ? 없애야 함.
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
    });
  }

  @Post('create-page')
  @UsePipes(new JoiValidationPipe(reqCreatePageSchema))
  public async createPage(
    @Req() req, 
    @Res() res,
    @Body() requiredBklogInfo: ReqCreatePage
  ) {
    const { id, error }  = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {

      const profileId: string | null = await this.getProfileId(id);

      if(!profileId) {
        this.clearUserJwtCookie(res);

        new Response()
        .error(...AuthErrorMessage.info)
        .res(res)
        .send();

      } else {
        const response: Response = await this.bklogService.createBklog(
          Object.assign(requiredBklogInfo, { 
            userId: id,
            profileId
          })
        );  
        
        response.res(res).send();
      }

    }
    
  }

  @Get('getpage')
  public async getPage(@Res() res, @Req() req, @Query('id') pageId: string): Promise<void> {
    const { id, error, accessToken } = this.validationAccessToken(req);

    if(!id && accessToken) {
      this.responseCheckToken(error, res);
    } else {
      let response: Response;
      const profileId: string | null = await this.getProfileId(id);
  
      if(!profileId) {
        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);
      } else {
        response = await this.bklogService.getPage(pageId, profileId); 
        
      }
      response.res(res).send();
    }
  }

  @Get('t-getpage')
  public async testGetPage(@Res() res, @Req() req, @Query('id') pageId: string) {
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

  @Post('add-pageeditor')
  @UsePipes(new JoiValidationPipe(reqEditPageEditorSchema))
  public async addPageEditor(@Req() req, @Res() res, @Body() { pageId, targetProfileId }: ReqEditPageEditor) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {
      const profileId: string | null = await this.getProfileId(id);
      let response: Response;

      if(!profileId) {
        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);
      } else {
        response = await this.bklogService.containerEditPageEditor(
          pageId, 
          profileId, 
          targetProfileId,
          this.bklogService.addPageEditor
        );
      }

      response.res(res).send();
    }

  }

  @Post('exclude-pageeditor')
  @UsePipes(new JoiValidationPipe(reqEditPageEditorSchema))
  public async excludeFromPageEditorList(@Req() req, @Res() res, @Body() { pageId, targetProfileId }: ReqEditPageEditor) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {
      const profileId: string | null = await this.getProfileId(id);
      let response: Response;

      if(!profileId) {
        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);
      } else {
        response = await this.bklogService.containerEditPageEditor(
          pageId,
          profileId,
          targetProfileId,
          this.bklogService.excludeFromPageEditorlist
        );
      }

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

  @Post('updatebklog')
  @UsePipes(new JoiValidationPipe(reqUpdateBklogSchema))
  public async updateBklog(@Req() req, @Res() res, @Body() { data, pageId, pageVersions }: ReqUpdateBklog) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {
      const profileId: string | null = await this.getProfileId(id);
      let response: Response;

      if(!profileId) {

        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);

      } else {
        response = await this.bklogService.updateBklog(data, pageId, id, profileId, pageVersions);
      }

      response.res(res).send();
    }
  }

  @Get('getmodifydata')
  public async getModifyData(@Res() res, @Query("id") id, @Query("preId") preId: string) {
    const response: Response = await this.bklogService.getModifyData(id, preId);

    response.res(res).send();
  }

  @Post('updatepageinfo')
  @UsePipes(new JoiValidationPipe(reqUpdatePageInfoSchema))
  public async updatePageInfo(
    @Req() req, 
    @Res() res,
    @Body() { data, pageId }: ReqUpdatePageInfo
  ) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {

      const profileId: string | null = await this.getProfileId(id);
      let response: Response;

      if(!profileId) {

        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);

      } else {

        response = await this.bklogService.updatePageInfo(
          data,
          pageId,
          id,
          profileId
        );
      }
      
      response.res(res).send();
    }
  }

  @Delete('delete-page')
  @UsePipes(new JoiValidationPipe(reqDeletePageSchema))
  public async deletePage(
    @Req() req, 
    @Res() res, 
    @Body() { pageId }: ReqDeletePage
  ) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      this.responseCheckToken(error, res);
    } else {
      const profileId: string | null = await this.getProfileId(id);
      let response: Response;

      if(!profileId) {
        this.clearUserJwtCookie(res);
        response = new Response().error(...AuthErrorMessage.info);
      } else {
        response = await this.bklogService.deletePage(pageId, id, profileId);
      }

      response.res(res).send();
    }

  }

  @Get('test')
  public async test(@Req() req) {
    console.log(req.headers['X-FORWARDED-FOR'])
    
    return "success";
  }

  @Get('test-remove-page')
  public async testRemovePage(@Res() res, @Query('pageid') pageId: string) {
    const response: Response = await this.bklogService.testRemovePage(pageId);

    response.res(res).send();
  }

}
