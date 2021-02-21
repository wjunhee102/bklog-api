import { Controller, Post, Req, Res, Body, Logger, Get } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { signInSchema } from './auth.schema';
import { SignInUser, UserJwtTokens } from './auth.type';
import { ResponseMessage } from 'src/util/response.util';
import { ValidationData } from 'src/types/validation';
import { PublicUserInfo } from 'src/types/public';
import { createCookieOption, cookieExpTime } from 'secret/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ){}

  @Post("sign-in") 
  public async signInUser(@Req() req, @Res() res, @Body() signInUser: SignInUser) {
    const { value, error }: ValidationData<SignInUser> = signInSchema.validate(signInUser);

    if(error) {
      Logger.error(error);
      return new ResponseMessage().error(999).body("Parameter Error").build();
    }

    const verifiedUser: PublicUserInfo = await this.userService.identifyUser(value);
    
    const jwtTokens: UserJwtTokens = this.authService.issueTokensToUser({
      name: verifiedUser.name,
      email: verifiedUser.email,
      agent: req.headers["user-agent"]
    });

    res.cookie(
      "AC_CERT", 
      jwtTokens.accessToken, 
      createCookieOption(cookieExpTime.access)
    );
    res.cookie(
      "RF_CERT", 
      jwtTokens.accessToken, 
      createCookieOption(cookieExpTime.access)
    );
    res.send(new ResponseMessage().success().body(verifiedUser).build());
  }

  @Get("test") 
  public async testAccessToken(@Req() req) {
    const accessToken = req.signedCookies.AC_CERT;
  
    const test = this.authService.validationAccessToken(accessToken, req.headers["user-agent"]);
    
    return new ResponseMessage().success().body(test).build();
  }

}
