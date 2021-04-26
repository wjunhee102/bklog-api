import { Controller, Post, Req, Res, Body, Logger, Get, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authInfoSchema, requiredUserInfoSchema, activateUserSchema } from './auth.schema';
import { ResSignInUser, UserJwtokens, ResSignUpUser, ResWithdrawalUser, TargetUser, ACCESS_TOKEN, REFRESH_TOKEN } from './auth.type';
import { ResponseMessage } from 'src/utils/base/response.util';
import { ValidationData } from 'src/types/validation';
import { createCookieOption, cookieExpTime } from 'secret/constants';
import { UserAuthInfo, RequiredUserInfo } from './private-user/types/private-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  private setUserJwtCookies(@Res() res, jwtTokens: UserJwtokens) {
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

  private clearUserJwtCookie(@Res() res) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }

  private clearUserJwtCookieAccess(@Res() res) {
    res.clearCookie(ACCESS_TOKEN);
  }

  @Post('sign-up')
  public async signUpUser(@Body() requiredUserInfo: RequiredUserInfo) {
    const { value, error }: ValidationData<RequiredUserInfo> = requiredUserInfoSchema.validate(requiredUserInfo);

    if(error) {
      return ResponseMessage(error);
    }

    const resSignUpUser: ResSignUpUser = await this.authService.signUpUser(value);

    return resSignUpUser.success? 
      ResponseMessage(resSignUpUser) 
      : ResponseMessage(resSignUpUser, "vaildationError");
  }

  @Post('sign-in') 
  public async signInUser(
    @Req() req, 
    @Res() res, 
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const { value, error }: ValidationData<UserAuthInfo> = authInfoSchema.validate(userAuthInfo);
    console.log(value);
    if(error) {
      res.send(ResponseMessage(error));
    } else {
      const resSignInUser: ResSignInUser = 
      await this.authService.signInUser(value, req.headers["user-agent"]);
    
      if(!resSignInUser.success) {
        Logger.error("Authentication failure");
        this.clearUserJwtCookie(res);
      } else {
        this.setUserJwtCookies(res, resSignInUser.jwt);
      }

      const result = Object.assign({}, resSignInUser);
      
      delete result.jwt;
      console.log(result);
      res.send(ResponseMessage(result));
    }
    
  }
  
  @Get('check-token')
  public async valudationAccessToken(
    @Req() req,
    @Res() res
  ) {
    const result = {
      success: false,
      userId: null,
      error: null
    }
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    if(!accessToken) {
      result.error = "not cookie";
    } else {
      const resValitionAC = this.authService.validateAccessTokenReturnId(
        accessToken,
        req.headers["user-agent"]
      );
      
      result.userId = resValitionAC.uuid;
      if(resValitionAC.error) {
        result.error = resValitionAC.error
      } else {
        result.success = true
      }
    
    }

    if(result.error) {
      this.clearUserJwtCookie(res);
    } else {
      result.success = true;
    }

    res.send(ResponseMessage(result));
  }

  @Get('reissue-token') 
  public async reissueTokensToUser(
    @Req() req, 
    @Res() res
  ) {

    const jwtTokens: UserJwtokens | null = 
      await this.authService.reissueTokens(
        req.signedCookies[REFRESH_TOKEN],
        req.headers["user-agent"]
      )

    if(!jwtTokens) {
      this.clearUserJwtCookie(res);
      res.send(ResponseMessage({success: false}));
    } else {
      this.setUserJwtCookies(res, jwtTokens);
      res.send(ResponseMessage({success: true}));
    }
    
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
      res.send(ResponseMessage({success: true}));
    } else {
      res.send(ResponseMessage({
        success: false,
        error: "Cookie information mismatch" 
      }));
    }
    
  }

  @Delete('withdrawal')
  public async withdrawalUser(
    @Req() req,
    @Res() res,
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const { value, error }: ValidationData<UserAuthInfo> = authInfoSchema.validate(userAuthInfo);

    if(error) {
      res.send(ResponseMessage(error));
    } else {
      const accessToken = req.signedCookies[ACCESS_TOKEN];
      const refreshToken = req.signedCookies[REFRESH_TOKEN];
      
      if(!refreshToken || !accessToken) {
        this.clearUserJwtCookie(res);
        res.send(ResponseMessage("Cookie information mismatch"));
      } else {
        const resWithdrawalUser: ResWithdrawalUser = await this.authService.withdrawalUser(
          value, 
          accessToken,
          refreshToken,
          req.headers["user-agent"]
        );
    
        if(resWithdrawalUser.success) {
          this.clearUserJwtCookie(res);
        } 

        res.send(ResponseMessage(resWithdrawalUser));

      }
    }
  }

  @Post('user-activation')
  public async activateUser(
    @Req() req, 
    @Res() res, 
    @Body() tagetUser: TargetUser
  ) {
    const { value, error }: ValidationData<TargetUser> = activateUserSchema.validate(tagetUser);

    if(error) {
      res.send(ResponseMessage(error));
    } else {
      const accessToken = req.signedCookies[ACCESS_TOKEN];
      
      if(accessToken) {
        const result = await this.authService.activateUser(
          accessToken,
          req.headers["user-agent"],
          value.email
        );
  
        if(!result.success) {
          this.clearUserJwtCookieAccess(res);
        } 
        res.send(ResponseMessage(result));
      } else {
        res.send(ResponseMessage("No cookies"));
      }

    }

  }

  @Get('resign-in')
  public async reSignIn(@Req() req, @Res() res) {
    const accessToken = req.signedCookies[ACCESS_TOKEN];
    if(accessToken) {
      const result = await this.authService.simpleSignInUser(accessToken, req.headers["user-agent"]);

      if(!result.success) {
        this.clearUserJwtCookieAccess(res);
      } 
      res.send(ResponseMessage(result));

    } else {
      res.send(ResponseMessage("No cookies"));
    }
  }

}
