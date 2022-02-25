import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  validate(data: any): any {
    // console.log("sadsad")
    // const user = await this.authService.signInUser({email, password}, "mac");
    
    // if(!user) {
    //   throw new UnauthorizedException();
    // }

    // return user;
    console.log(data);
    return {
      test: true
    }
  }
}