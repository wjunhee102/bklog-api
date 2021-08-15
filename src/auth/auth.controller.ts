import { Controller, Post, Req, Res, Body, Logger, Get, Delete, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authInfoSchema, requiredUserInfoSchema, activateUserSchema } from './auth.schema';
import { ResSignInUser, UserJwtokens, ResSignUpUser, ResWithdrawalUser, TargetUser, ACCESS_TOKEN, REFRESH_TOKEN, ResCheckAccessToken, ResReissueTokens } from './auth.type';
import { ResponseMessage } from 'src/utils/common/response.util2';
import { ValidationData } from 'src/types/validation';
import { createCookieOption, cookieExpTime } from 'secret/constants';
import { UserAuthInfo, RequiredUserInfo, IdentifyUser } from './private-user/types/private-user.type';
import { CommonErrorMessage, Response, AuthErrorMessage, SystemErrorMessage } from 'src/utils/common/response.util';
import { JoiValidationPipe } from 'src/pipes/joi-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  private validationError(res) {
    new Response()
      .error(...CommonErrorMessage.validationError)
      .res(res)
      .send();
  }

  private setUserJwtCookies(res, jwtTokens: UserJwtokens) {
    res.cookie(
      ACCESS_TOKEN, 
      jwtTokens.accessToken, 
      createCookieOption(cookieExpTime.access)
    );
    res.cookie(
      REFRESH_TOKEN, 
      jwtTokens.refreshToken, 
      createCookieOption(cookieExpTime.refresh)
    );
  }

  private clearUserJwtCookie(res) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }

  private clearUserJwtCookieAccess(res) {
    res.clearCookie(ACCESS_TOKEN);
  }

  @Post('sign-up')
  @UsePipes(new JoiValidationPipe(requiredUserInfoSchema))
  public async signUpUser(@Res() res, @Body() requiredUserInfo: RequiredUserInfo) {
    const response: Response = await this.authService.signUpUser(requiredUserInfo);

    response.res(res).send();
  }

  @Post('sign-in') 
  @UsePipes(new JoiValidationPipe(authInfoSchema))
  public async signInUser(
    @Req() req, 
    @Res() res, 
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
    @Req() req,
    @Res() res
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
    @Req() req, 
    @Res() res
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
  public async signOutUser(@Req() req, @Res() res) {
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

  /**
   * Response message 수정해야 함.
   * @param req 
   * @param res 
   * @param userAuthInfo 
   */
  @Delete('withdrawal')
  @UsePipes(new JoiValidationPipe(authInfoSchema))
  public async withdrawalUser(
    @Req() req,
    @Res() res,
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    const refreshToken = req.signedCookies[REFRESH_TOKEN];
    
    if(!refreshToken || !accessToken) {

      this.clearUserJwtCookie(res);
      new Response().error(...AuthErrorMessage.info).res(res).send();

    } else {

      const resWithdrawalUser: ResWithdrawalUser = await this.authService.withdrawalUser(
        userAuthInfo, 
        accessToken,
        refreshToken,
        req.headers["user-agent"]
      );
  
      if(resWithdrawalUser.success) {
        this.clearUserJwtCookie(res);
        new Response().body("success").res(res).send();
      } else {
        new Response().error(...SystemErrorMessage.db).res(res).send();
      } 

    }

  }

  @Post('user-activation')
  @UsePipes(new JoiValidationPipe(activateUserSchema))
  public async activateUser(
    @Req() req, 
    @Res() res, 
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
  public async reSignIn(@Req() req, @Res() res) {
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
  public async checkEmailAddress(@Req() req, @Res() res) {

  }

  @Get('check-penname')
  public async checkPenName(@Req() req, @Res() res) {

  }

}
