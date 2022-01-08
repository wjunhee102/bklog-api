import { Req } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { ACCESS_TOKEN, REFRESH_TOKEN, TokenVailtionType, ResTokenValidation, ResValitionAccessToken } from 'src/auth/auth.type';
import { AuthErrorMessage, Response } from "src/utils/common/response.util";

export class BaseController {
  constructor(
    private readonly authService: AuthService
  ){}

  public clearUserJwtCookie(res) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }

  public validationAccessToken(@Req() req): ResTokenValidation {
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

  public responseCheckToken({ infoFalse } : TokenVailtionType ,res): void {
    const response: Response = new Response();

    if(infoFalse) {
      this.clearUserJwtCookie(res);
      response.error(...AuthErrorMessage.info);
    } else {
      response.error(...AuthErrorMessage.exp);
    }

    response.res(res).send();
  }

  public validateAccessTokenReturnId(
    accessToken: string,
    userAgent: string
  ): ResValitionAccessToken {
    return this.authService.validateAccessTokenReturnId(accessToken, userAgent);
  }

  public async checkUserIdNProfileId(
    userId: string, profileId: string
  ): Promise<boolean> {
    return this.authService.checkUserIdNProfileId(userId, profileId);
  }

  public async checkUserIdNPenName(
    userId: string, penName: string
  ): Promise<boolean> {
    return this.authService.checkUserIdNPenName(userId, penName);
  }

  public async getProfileId(userId: string): Promise<string | null> {
    return this.authService.getProfileId(userId);
  }
}