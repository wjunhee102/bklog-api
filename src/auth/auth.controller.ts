import { Controller, Post, Req, Res, Body, Logger, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authInfoSchema, registerSchema } from './auth.schema';
import { ResSignInUser, UserJwtokens, ResRegisterUser } from './auth.type';
import { ResponseMessage } from 'src/util/response.util';
import { ValidationData } from 'src/types/validation';
import { createCookieOption, cookieExpTime } from 'secret/constants';
import { UserAuthInfo, RegiInfoUser } from 'src/user/user.type';
import { UserService } from 'src/user/user.service';
import { PrivateUserService } from './private-user/private-user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly privateUserService: PrivateUserService
  ){}

  private readonly jwtCookiesName = {
    ACCESS: "AC_CERT",
    REFRESH: "RF_CERT"
  }

  private setParmeterError(error) {
    Logger.error(error);
    return new ResponseMessage()
      .error(999)
      .body("Parameter Error")
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

  @Post('sign-up')
  public async signUpUser(@Body() regiInfoUser: RegiInfoUser) {
    const { value, error }: ValidationData<RegiInfoUser> = registerSchema.validate(regiInfoUser);

    if(error) {
      return this.setParmeterError(error);
    }

    const resRegisterUser: ResRegisterUser = await this.userService.registerUser(value);

    return new ResponseMessage().success().body(resRegisterUser).build();
  } 

  @Post('sign-in') 
  public async signInUser(
    @Req() req, 
    @Res() res, 
    @Body() userAuthInfo: UserAuthInfo
  ) {
    const { value, error }: ValidationData<UserAuthInfo> = authInfoSchema.validate(userAuthInfo);

    if(error) {
      return this.setParmeterError(error);
    }

    const verifiedUser: ResSignInUser = 
      await this.authService.signInUser(value, req.headers["user-agent"]);
    
    if(!verifiedUser.success) {
      Logger.error("Authentication failure");
      console.log(verifiedUser)
      
      this.clearUserJwtCookie(res);
      res.send(new ResponseMessage().error(999).body({
          success: verifiedUser.success,
          userInfo: verifiedUser.userInfo,
          countFail: verifiedUser.countFail,
          isActive: verifiedUser.isActive
        }).build());

    } else {

      this.setUserJwtCookies(res, verifiedUser.jwt);
      res.send(new ResponseMessage().success().body({
        success: verifiedUser.success,
        userInfo: verifiedUser.userInfo
      }).build());
    }
  }

  @Get('reissue-token') 
  public async reissueTokensToUser(@Req() req, @Res() res) {
    
    const jwtTokens: UserJwtokens | null = 
      await this.authService.reissueTokens(
        req.signedCookies[this.jwtCookiesName.REFRESH],
        req.headers["user-agent"]
      )

    if(!jwtTokens) {
      this.clearUserJwtCookie(res);
      res.send(new ResponseMessage().error(999).body({success: false}).build());
    } else {

      this.setUserJwtCookies(res, jwtTokens);

      res.send(new ResponseMessage().success().body({success: true}).build());
    }
    
  }

  @Get('sign-out')
  public signOutUser(@Res() res) {
    this.clearUserJwtCookie(res);
    res.send(new ResponseMessage().success().body({success: true}).build());
  }

  @Get('test-access') 
  public async testAccessToken(@Req() req) {
    const accessToken = req.signedCookies[this.jwtCookiesName.ACCESS];
  
    const test = this.authService.validationAccessToken(accessToken, req.headers["user-agent"]);

    if(test) {
      return new ResponseMessage().error(999).body(test).build();
    }

    return new ResponseMessage().success().body(test).build();
  }

  @Post('withdrawal')
  public async withdrawalUser(@Body() userAuthInfo: UserAuthInfo) {
    
  }

  @Get('test-create')
  public async testCreateUser() {
    this.privateUserService.testRegisterUser();
    return new ResponseMessage().success().body("success").build();
  }

}
