import { Controller, Post, Req, Res, Body, Logger, Get, Delete, UsePipes, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authInfoSchema, requiredUserInfoSchema, activateUserSchema } from './dto/auth.schema';
import { UserJwtokens, TargetUser, ACCESS_TOKEN, REFRESH_TOKEN, ResCheckAccessToken, ResReissueTokens, TokenVailtionType, CookieAuthenticationFailure } from './auth.type';
import { ResponseMessage } from 'src/utils/common/response.util2';
import { createCookieOption, cookieExpTime } from 'secret/constants';
import { UserAuthInfo, RequiredUserInfo } from './private-user/types/private-user.type';
import { CommonErrorMessage, Response, AuthErrorMessage } from 'src/utils/common/response.util';
import { JoiValidationPipe } from 'src/pipes/joi-validation.pipe';
import { ResTokenValidation } from 'src/auth/auth.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  private validationError(res: any) {
    new Response()
      .error(...CommonErrorMessage.validationError)
      .res(res)
      .send();
  }

  private setUserJwtCookies(res: any, jwtTokens: UserJwtokens) {
    res.cookie(
      ACCESS_TOKEN, 
      jwtTokens.accessToken, 
      createCookieOption(process.env.DOMAIN)(cookieExpTime.access)
    );
    res.cookie(
      REFRESH_TOKEN, 
      jwtTokens.refreshToken, 
      createCookieOption(process.env.DOMAIN)(cookieExpTime.refresh)
    );
  }

  private clearUserJwtCookie(res: any) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }

  private clearUserJwtCookieAccess(res: any) {
    res.clearCookie(ACCESS_TOKEN);
  }

  private validationAccessToken(@Req() req: any): ResTokenValidation {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    const userAgent = req.headers["user-agent"];

    if(!accessToken) {
      return {
        id: null,
        accessToken: false,
        error: {
          infoFalse: true,
          expFalse: false
        }
      }
    }

    return Object.assign({}, this.authService.validateAccessTokenReturnId(accessToken, userAgent), {
      accessToken: true
    });
  }

  private responseCheckToken({ infoFalse } : TokenVailtionType | CookieAuthenticationFailure ,res: any): void {
    const response: Response = new Response();

    if(infoFalse) {
      this.clearUserJwtCookie(res);
      response.error(...AuthErrorMessage.info);
    } else {
      response.error(...AuthErrorMessage.exp);
    }

    response.res(res).send();
  }

  @Post('sign-up')
  @UsePipes(new JoiValidationPipe(requiredUserInfoSchema))
  public async signUpUser(@Res() res: any, @Body() requiredUserInfo: RequiredUserInfo) {
    const response: Response = await this.authService.signUpUser(requiredUserInfo);

    response.res(res).send();
  }

  @Post('sign-in') 
  @UsePipes(new JoiValidationPipe(authInfoSchema))
  public async signInUser(
    @Req() req: any, 
    @Res() res: any, 
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const response: Response = await this.authService.signInUser(userAuthInfo, req.headers["user-agent"]);
  
    if(!response.Data.jwt) {
      Logger.error("Authentication failure");
      this.clearUserJwtCookie(res);
    } else {
      this.setUserJwtCookies(res, response.Data.jwt);
      const userInfo = response.Data.userInfo;
      response.body(userInfo);
    }

    response.res(res).send(); 
  }
  
  /**
   * @param req 
   * @param res 
   */
  @Get('check-token')
  public async valudationAccessToken(
    @Req() req: any,
    @Res() res: any
  ) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    if(!accessToken) {
      
      new Response()
        .error(...AuthErrorMessage.notCookie)
        .res(res)
        .send();

    } else {
      const { response, clearToken }: ResCheckAccessToken = this.authService.checkAccessToken(
        accessToken,
        req.headers["user-agent"]
      );
    
      if(clearToken) this.clearUserJwtCookie(res);

      response.res(res).send();
    }
    
  }

  @Get('reissue-token') 
  public async reissueTokensToUser(
    @Req() req: any, 
    @Res() res: any
  ) {
    const { response, userJwt }: ResReissueTokens  = 
      await this.authService.reissueTokens(
        req.signedCookies[REFRESH_TOKEN],
        req.headers["user-agent"]
      );

    if(!userJwt) {
      this.clearUserJwtCookie(res);
    } else {
      this.setUserJwtCookies(res, userJwt);
    }

    response.res(res).send();
  }

  @Get('sign-out')
  public async signOutUser(@Req() req: any, @Res() res: any) {
    const refreshToken = req.signedCookies[REFRESH_TOKEN];
    const resSignOut = refreshToken? await this.authService.signOutUser(
      refreshToken,
      req.headers["user-agent"]
    ) : false;

    this.clearUserJwtCookie(res);

    if(resSignOut) {
      new Response().body("success").res(res).send();
    } else {
      new Response().error(...AuthErrorMessage.info).res(res).send();
    }
    
  }  

  @Post('user-activation')
  @UsePipes(new JoiValidationPipe(activateUserSchema))
  public async activateUser(
    @Req() req: any, 
    @Res() res: any, 
    @Body() tagetUser: TargetUser
  ) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    
    if(accessToken) {
      const result = await this.authService.activateUser(
        accessToken,
        req.headers["user-agent"],
        tagetUser.email
      );

      if(!result.success) {
        this.clearUserJwtCookieAccess(res);
      } 
      res.send(ResponseMessage(result));
    } else {
      res.send(ResponseMessage("No cookies"));
    }

  }

  @Get('resign-in')
  public async reSignIn(@Req() req: any, @Res() res: any) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];

    if(accessToken) {
      const { response, clearToken } = await this.authService.simpleSignInUser(accessToken, req.headers["user-agent"]);
      
      if(clearToken) this.clearUserJwtCookie(res);
      
      response.res(res).send();
    } else {
      new Response().error(...AuthErrorMessage.info).res(res).send();
    }
  }

  @Get('check-email')
  public async checkEmailAddress(@Res() res: any, @Query("email") email: string) {
    if(!email) {
      new Response()
        .body("y")
        .res(res)
        .send();
    } else {
      const response: Response = await this.authService.checkEmailUsed(email);

      response.res(res).send();
    }
  }

  @Get('check-penname')
  public async checkPenName(@Res() res: any, @Query("penname") penName: string) {
    if(!penName) {
      new Response()
        .body("y")
        .res(res)
        .send();
    } else {
      const response: Response = await this.authService.checkPenNameUsed(penName);

      response.res(res).send();
    }
  }

  @Get('test-delete-user')
  public async testDeleteUser(@Res() res: any, @Query("email") email: string) {
    const response: Response = await this.authService.testDeleteUser(email);

    response.res(res).send();
  }

  @Delete('withdrawal')
  @UsePipes(new JoiValidationPipe(authInfoSchema))
  public async deleteUser(@Req() req: any, @Res() res: any, @Body() userInfo: UserAuthInfo) {
    const { id, error } = this.validationAccessToken(req);

    if(!id) {
      if(error) this.responseCheckToken(error, res);
    } else {
      const response: Response = await this.authService.withdrawalUser(Object.assign({}, {
        ...userInfo, 
        id
      }));

      response.res(res).send();
    }
  }

}
