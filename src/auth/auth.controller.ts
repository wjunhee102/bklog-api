import { Controller, Post, Req, Res, Body, Logger, Get, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authInfoSchema, registerSchema, requiredUserInfoSchema, activateUserSchema, reissueTokenSchema } from './auth.schema';
import { ResSignInUser, UserJwtokens, ResSignUpUser, ResWithdrawalUser, ClientUserInfo, TargetUser } from './auth.type';
import { ResponseMessage } from 'src/util/response.util';
import { ValidationData } from 'src/types/validation';
import { createCookieOption, cookieExpTime } from 'secret/constants';
import { UserAuthInfo, RequiredUserInfo } from './private-user/types/private-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  private readonly jwtCookiesName = {
    ACCESS: "AID",
    REFRESH: "RID"
  }

  private setResponseError(error, body: any = "Parameter Error") {
    Logger.error(error);
    return new ResponseMessage()
      .error(999)
      .body(body)
      .build();
  }

  private setResponseSuccess(body) {
    return new ResponseMessage()
      .success()
      .body(body)
      .build();
  }

  private setUserJwtCookies(@Res() res, jwtTokens: UserJwtokens) {
    res.cookie(
      this.jwtCookiesName.ACCESS, 
      jwtTokens.accessToken, 
      createCookieOption(cookieExpTime.access)
    );
    res.cookie(
      this.jwtCookiesName.REFRESH, 
      jwtTokens.refreshToken, 
      createCookieOption(cookieExpTime.refresh)
    );
  }

  private clearUserJwtCookie(@Res() res) {
    res.clearCookie(this.jwtCookiesName.ACCESS);
    res.clearCookie(this.jwtCookiesName.REFRESH);
  }

  private clearUserJwtCookieAccess(@Res() res) {
    res.clearCookie(this.jwtCookiesName.ACCESS);
  }

  @Post('sign-up')
  public async signUpUser(@Body() requiredUserInfo: RequiredUserInfo) {
    const { value, error }: ValidationData<RequiredUserInfo> = requiredUserInfoSchema.validate(requiredUserInfo);

    if(error) {
      return this.setResponseError(error);
    }

    const resSignUpUser: ResSignUpUser = await this.authService.signUpUser(value);

    return resSignUpUser.success? 
      this.setResponseSuccess(resSignUpUser)
      : this.setResponseError("vaildationError",resSignUpUser);
  }

  @Post('sign-in') 
  public async signInUser(
    @Req() req, 
    @Res() res, 
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const { value, error }: ValidationData<UserAuthInfo> = authInfoSchema.validate(userAuthInfo);

    if(error) {
      return this.setResponseError(error);
    }

    const resSignInUser: ResSignInUser = 
      await this.authService.signInUser(value, req.headers["user-agent"]);
    
    if(!resSignInUser.success) {
      Logger.error("Authentication failure");

      this.clearUserJwtCookie(res);
      res.send(this.setResponseError("Authentication failure", {
        success: false,
        error: resSignInUser.error
      }));

    } else {

      this.setUserJwtCookies(res, resSignInUser.jwt);
      res.send(this.setResponseSuccess({
        success: resSignInUser.success,
        userInfo: resSignInUser.userInfo
      }));
    }
  }

  @Post('reissue-token') 
  public async reissueTokensToUser(
    @Req() req, 
    @Res() res, 
    @Body() client: ClientUserInfo
  ) {
    const { value, error }: ValidationData<ClientUserInfo> = reissueTokenSchema.validate(client);

    if(error) {
      this.clearUserJwtCookie(res);
      res.send(this.setResponseError(error));
    } else {

      const jwtTokens: UserJwtokens | null = 
        await this.authService.reissueTokens(
          req.signedCookies[this.jwtCookiesName.REFRESH],
          req.headers["user-agent"],
          value
        )

      if(!jwtTokens) {
        this.clearUserJwtCookie(res);
        res.send(this.setResponseError("Token does not exist"), {success: false});
      } else {
        this.setUserJwtCookies(res, jwtTokens);
        res.send(this.setResponseSuccess({success: true}));
      }

    }
    
    
    
  }

  @Get('sign-out')
  public async signOutUser(@Req() req, @Res() res) {
    const refreshToken = req.signedCookies[this.jwtCookiesName.REFRESH];
    const resSignOut = refreshToken? await this.authService.signOutUser(
      refreshToken,
      req.headers["user-agent"]
    ) : false;

    this.clearUserJwtCookie(res);

    if(resSignOut) {
      res.send(this.setResponseSuccess({success: true}));
    } else {
      res.send(this.setResponseError(
          "Cookie information mismatch",
          { error: "Cookie information mismatch" }
        )
      );
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
      res.send(this.setResponseError(error));
    } else {
      const accessToken = req.signedCookies[this.jwtCookiesName.ACCESS];
      const refreshToken = req.signedCookies[this.jwtCookiesName.REFRESH];
      
      if(!refreshToken || !accessToken) {
        this.clearUserJwtCookie(res);
        res.send(this.setResponseError(
          "Cookie information mismatch",
          { error: "Cookie information mismatch" }
        ));

      } else {

        const resWithdrawalUser: ResWithdrawalUser = await this.authService.withdrawalUser(
          value, 
          accessToken,
          refreshToken,
          req.headers["user-agent"]
        );
    
        if(resWithdrawalUser.success) {
          this.clearUserJwtCookie(res);
          res.send(this.setResponseSuccess(resWithdrawalUser));
        } else {
          res.send(this.setResponseError("you entered an incorrect value", registerSchema));
        }

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
      res.send(this.setResponseError(error));
    } else {
      const accessToken = req.signedCookies[this.jwtCookiesName.ACCESS];
      
      if(accessToken) {
        const result = await this.authService.activateUser(
          accessToken,
          req.headers["user-agent"],
          value.email
        );
  
        if(result.success) {
          res.send(this.setResponseSuccess(result));
        } else {
          this.clearUserJwtCookieAccess(res);
          res.send(this.setResponseError("user-activation", result));
        }
      } else {
        res.send(this.setResponseError("No cookies", {
          success: false
        }))
      }

    }

  }

  @Get('re-sign-in')
  public async reSignIn(@Req() req, @Res() res) {
    const accessToken = req.signedCookies[this.jwtCookiesName.ACCESS];
    if(accessToken) {
      const result = await this.authService.simpleSignInUser(accessToken, req.headers["user-agent"]);

      if(result.success) {
        res.send(this.setResponseSuccess(result));
      } else {
        this.clearUserJwtCookieAccess(res);
        res.send(this.setResponseError(result));
      }

    } else {
      res.send(this.setResponseError("No cookies", {
        success: false
      }));
    }
  }

}
