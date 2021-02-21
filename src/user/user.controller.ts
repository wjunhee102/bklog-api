import { Body, Controller, Logger, Post, Res, Get, Req } from '@nestjs/common';
import { ValidationError } from 'Joi';

import { Response, ResponseMessage } from '../util/response.util';
import { loginSchema, registerSchema } from './user.schema';
import { UserService } from './user.service';
import { Register, UnverifiedUser } from './user.type';
import { cookieExpTime, createCookieOption } from 'secret/constants';

@Controller('auth/user')
export class UserController {

  constructor(private readonly userService: UserService){}

  @Post("register")
  public async addUser(@Body() register: Register): Promise<Response> {
    console.log(register);
    try {
      const { value, error }: { value: Register, error?: ValidationError } = registerSchema.validate(register);

      if (error) {
        Logger.error(error);
        return new ResponseMessage().error(999).body("Parameter Error").build();
      }

      const user: any = await this.userService.registerUser(value);

      return new ResponseMessage().success().body(user).build();
    } catch (err) {
      Logger.error(err);
    }
  }

  @Post('login')
  public async login(@Req() req,@Res() res, @Body() login: UnverifiedUser): Promise<Response> {
    const { value, error }: { value: UnverifiedUser, error?: ValidationError } = loginSchema.validate(login);

    if (error) {
      Logger.error(error);
      return new ResponseMessage().error(999).body("Parameter Error").build();
    }
    console.log("user-agent", req.headers["user-agent"])
    const user = await this.userService.login(Object.assign({}, value, {
      agent: req.headers["user-agent"]
    }));

    if (!user) {
      return new ResponseMessage().error(999, "Login Error").build();
    }

    console.log("cookie: ", req.cookies.test);
    console.log("signedCookie: ", req.signedCookies.AC_CERT);

    res.cookie("AC_CERT", user.jwt.access, createCookieOption(cookieExpTime.access));
    res.cookie("RF_CERT", user.jwt.refresh, createCookieOption(cookieExpTime.refresh));

    res.send(new ResponseMessage().success().body({
      email: user.email,
      name: user.name
    }).build());
  }

  @Post('checkEmail')
  public async checkEmail(@Body() email: {email: string}): Promise<Response> {
    console.log(email);
    const validate = await this.userService.checkEmailAddress(email.email);

    return new ResponseMessage().success().body(validate).build();
  }

}