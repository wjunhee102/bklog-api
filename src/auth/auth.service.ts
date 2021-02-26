import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtExpTime, accessExpTime, refreshExpTime } from 'secret/constants';
import { JwtUserPayload, TokenVailtionRes, ResSignInUser, UserJwtokens } from './auth.type';
import { ResIdentifyUser, UserInfo, UserAuthInfo } from 'src/user/user.type';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService
  ){}

  /**
   * return UserJwtTokens
   * @param VerifiedUser 
   */
  private issueTokensToUser(VerifiedUser: JwtUserPayload): UserJwtokens {
    return {
      accessToken: this.jwtService.sign(
        Object.assign({ type: "access" }, VerifiedUser), {
        expiresIn: jwtExpTime.accessToken
      }),
      refreshToken: this.jwtService.sign(
        Object.assign({ type: "refresh" },VerifiedUser), {
        expiresIn: jwtExpTime.refreshToken
      })
    }
  }

  /**
   * success시 return null
   * @param refreshExpTime
   * @param userAgent 
   */
  private validationRefreshToken(
    refreshToken: string, 
    userAgent: string
  ): { uuid: string } | null {
    const decodingUserJwt: any = this.jwtService.decode(refreshToken);
    if(!decodingUserJwt || decodingUserJwt.type !== "refresh") {
      return null;
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + refreshExpTime > Date.now();

    if(!checkAgent || !checkExpTime) {
      return null;
    } 

    return {
      uuid: decodingUserJwt.uuid 
    }
  } 

  /**
   * return UserJwtTokens & PublicUserInfo
   * @param userInfo 
   * @param userAgent 
   */
  public async signInUser(
    unverifieduserInfo: UserAuthInfo, 
    userAgent: string
  ): Promise<ResSignInUser> {
    const verifiedUser: ResIdentifyUser = await this.userService.identifyUser(unverifieduserInfo);

    let success:boolean = false;
    let countFail: number = verifiedUser.count;
    let userInfo: UserInfo | null = null;
    let jwt: UserJwtokens | null = null;
    let isActive: boolean = verifiedUser.isActive;

    if(verifiedUser.userInfo) {
      const { name, email, uuid } = verifiedUser.userInfo;

      userInfo = {
        name,
        email,
        uuid
      }
      jwt = this.issueTokensToUser({
        uuid,
        agent: userAgent
      })

      success = true;
    } 

    return {
      success,
      userInfo,
      jwt,
      countFail,
      isActive
    };
  }

  /**
   * success시 return null
   * @param accessToken 
   * @param userAgent 
   */
  public validationAccessToken(
    accessToken: string, 
    userAgent: string
  ): TokenVailtionRes {
    const decodingUserJwt: any = this.jwtService.decode(accessToken);
    
    if(!decodingUserJwt || decodingUserJwt.type !== "access") {
      return {
        info: false,
        exp: false
      };
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + accessExpTime > Date.now();

    if(!checkAgent || !checkExpTime) {
      return {
        info: checkAgent,
        exp: checkExpTime
      }
    } 

    return null;
  } 

  /**
   * return UserJwtokens | null
   * @param refreshToken 
   * @param userAgent 
   */
  public async reissueTokens(
    refreshToken: string, 
    userAgent: string
  ): Promise<UserJwtokens | null> {

    const tokenVailtionRes: { uuid: string } | null = this.validationRefreshToken(
      refreshToken,
      userAgent
    );

    if(!tokenVailtionRes) {
      return null;
    }

    const user: UserInfo | null = await this.userService.getSignInUser(tokenVailtionRes.uuid);

    if(!user) {
      return null;
    }

    const jwtTokens: UserJwtokens = this.issueTokensToUser({
      uuid: user.uuid,
      agent: userAgent
    });

    return jwtTokens;
  }

  public async withdrawalUser(userInfo: UserAuthInfo) {
    
  }
}
