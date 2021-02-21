import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtExpTime, accessExpTime, refreshExpTime } from 'secret/constants';
import { JwtUserPayload, UserJwtTokens, DecodeJwt } from './auth.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService
  ){}

  public issueToAccessToken(VerifiedUser: JwtUserPayload) {
    return this.jwtService.sign(VerifiedUser, {
      expiresIn: jwtExpTime.accessToken
    })
  }

  public issueToRefreshToken(VerifiedUser: JwtUserPayload) {
    return this.jwtService.sign(VerifiedUser, {
      expiresIn: jwtExpTime.refreshToken
    })
  }

  public issueTokensToUser(VerifiedUser: JwtUserPayload): UserJwtTokens {
    return {
      accessToken: this.issueToAccessToken(VerifiedUser),
      refreshToken: this.issueToRefreshToken(VerifiedUser)
    }
  }

  /**
   * return error
   * @param accessToken 
   * @param userAgent 
   */
  public validationAccessToken(accessToken: string, userAgent: string): {
    info: boolean,
    exp: boolean
  } | null {
    const userInfo: any = this.jwtService.decode(accessToken);
    const checkAgent: boolean = userInfo.agent === userAgent;
    const checkExpTime = userInfo.exp * 1000 + accessExpTime >= Date.now();

    if(!checkAgent || !checkExpTime) {
      return {
        info: checkAgent,
        exp: checkExpTime
      }
    } 

    return null
  } 

  public validationRefreshToken(refreshToken: string, userAgent: string) {
    const userInfo: any = this.jwtService.decode(refreshToken);
    const checkAgent: boolean = userInfo.agent === userAgent;
    const checkExpTime = userInfo.exp * 1000 + refreshExpTime - Date.now();

    

  }

}
