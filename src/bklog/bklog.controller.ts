import { Controller, Post, Req, Res, Body, Get, Param, Query, ParseIntPipe, UsePipes, Delete, UseGuards, Request, Logger, Patch } from '@nestjs/common';
import { BklogService } from './bklog.service';
import { ReqCreatePage } from './page/page.type';
import { AuthService } from 'src/auth/auth.service';
import { ACCESS_TOKEN } from 'src/auth/auth.type';
import { ParamGetPageList, ReqDeletePage, ReqEditPageEditor, ReqUpdateBklog, ReqUpdatePageInfo } from './bklog.type';
import { Response, AuthErrorMessage } from 'src/utils/common/response.util';
import { reqCreatePageSchema, reqDeletePageSchema, reqEditPageEditorSchema, reqUpdateBklogSchema, reqUpdatePageInfoSchema } from './dto/bklog.shema';
import { JoiValidationPipe } from 'src/pipes/joi-validation.pipe';
import { BaseController } from 'src/common/base.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JoiValidationMutiPipe } from 'src/pipes/joi-validationMulti.pipe';

@Controller("bklog")
export class BklogController extends BaseController {
  constructor( 
    authService: AuthService,
    private readonly bklogService: BklogService
  ){ super(authService) }

  private async getPageList(
    res: any, 
    req: any, 
    factorGetPageList: ParamGetPageList
  ): Promise<void> {
    const { id, error, accessToken } = this.validationAccessToken(req);

    if(!id) {
      if(error && accessToken) this.responseCheckToken(error, res);
    } else {  
      const response = await this.bklogService.findPageList(factorGetPageList, id);

      response.res(res).send();
    }
    
  }

  @Get("list/penname/:penName")
  public async getPageListPenName(
    @Res() res: any,
    @Req() req: any, 
    @Param("penName") penName: string, 
    @Query("id") reqProfileId?: string
  ) {
 
    await this.getPageList(res, req, {
      pageUserInfo: {
        penName
      },
      reqProfileId
    });
  }

  // ? 없애야 함.
  @Get("list/id/:profileId")
  public async getPageListProfileId(
    @Res() res: any,
    @Req() req: any, 
    @Param("profileId") id: string, 
    @Query("id") reqProfileId?: string
  ) {
    await this.getPageList(
      res,
      req, {
      pageUserInfo: {
        id
      },
      reqProfileId
    });
  }

  @Post("page")
  @UsePipes(new JoiValidationPipe(reqCreatePageSchema))
  public async createPage(
    @Req() req: any, 
    @Res() res: any,
    @Body() requiredBklogInfo: ReqCreatePage
  ) {
    const { id, error }  = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
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

  @Get("page/:pageId")
  public async getPage(@Res() res: any, @Req() req: any, @Param("pageId") pageId: string): Promise<void> {
    const { id, error, accessToken } = this.validationAccessToken(req);

    if(!id) {
      if(error && accessToken) this.responseCheckToken(error, res);
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

  @Get("t-getpage")
  public async testGetPage(@Res() res: any, @Req() req: any, @Query("id") pageId: string) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    if(accessToken) {
      const resCheckCookie = this.validationAccessToken(req);

      if(!resCheckCookie.id) {
        if(resCheckCookie.error) this.responseCheckToken(resCheckCookie.error, res);
      } else {
        const response: Response = await this.bklogService.getPage(pageId, "4e17660a0ea99a83845cbf3c90f62700"); 
        response.res(res).send();
      }
    } else {
      const response: Response = await this.bklogService.getPage(pageId, "4e17660a0ea99a83845cbf3c90f62700"); 
      response.res(res).send();
    }

  }

  @Post("pageeditor")
  @UsePipes(new JoiValidationPipe(reqEditPageEditorSchema))
  public async addPageEditor(@Req() req: any, @Res() res: any, @Body() { pageId, targetProfileId }: ReqEditPageEditor) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
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

  @Delete("pageeditor")
  @UsePipes(new JoiValidationPipe(reqEditPageEditorSchema))
  public async excludeFromPageEditorList(@Req() req: any, @Res() res: any, @Body() { pageId, targetProfileId }: ReqEditPageEditor) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
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

  /**
   * TODO: 
   * 의미있는 리소스 이름으로 바꿀 것.
   */
  @Get("release-updating/:pageId")
  public async releaseUpdating(@Req() req: any, @Res() res: any, @Param("pageId") pageId: string) {
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

  @Post("page/:pageId")
  @UsePipes(new JoiValidationMutiPipe({ paramName: "pageId", bodySchema: reqUpdateBklogSchema }))
  public async updateBklog(@Req() req: any, @Res() res: any, @Param("pageId") pageId: string, @Body() { data, pageVersions }: ReqUpdateBklog) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
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

  @Get("modifydata/:id")
  public async getModifyData(@Res() res: any, @Param("id") id: string, @Query("preId") preId: string) {
    const response: Response = await this.bklogService.getModifyData(id, preId);

    response.res(res).send();
  }

  @Patch("page/:pageId")
  @UsePipes(new JoiValidationMutiPipe({ paramName: "pageId" , bodySchema: reqUpdatePageInfoSchema}))
  public async updatePageInfo(
    @Req() req: any, 
    @Res() res: any,
    @Param("pageId") pageId: string,
    @Body() { data }: ReqUpdatePageInfo
  ) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error)this.responseCheckToken(error, res);
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

  @Delete("page/:pageId")
  public async deletePage(
    @Req() req: any, 
    @Res() res: any, 
    @Param("pageId") pageId: string
  ) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
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

  @UseGuards(AuthGuard("local"))
  @Get("test")
  public async test(@Request() req: any) {
    
    return "success";
  }

  @Get("test-remove-page")
  public async testRemovePage(@Res() res: any, @Query("pageid") pageId: string) {
    const response: Response = await this.bklogService.testRemovePage(pageId);

    response.res(res).send();
  }

}
