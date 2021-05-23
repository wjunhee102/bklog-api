import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtExpTime, accessExpTime, refreshExpTime } from 'secret/constants';
import { JwtUserPayload, TokenVailtionRes, ResSignInUser, UserJwtokens, ResSignUpUser, ResWithdrawalUser, ResValitionAccessToken, ClientUserInfo, ACCESS, REFRESH, ResCheckAccessToken, ResReissueTokens } from './auth.type';
import { UserAuthInfo, UserIdList, UserIdNPenName } from './private-user/types/private-user.type';
import { RequiredUserInfo, ResAuthenticatedUser } from './private-user/types/private-user.type';
import { PrivateUserService } from './private-user/private-user.service';
import { ResponseError, AuthErrorMessage, Response, SystemErrorMessage, CommonErrorMessage } from 'src/utils/common/response.util';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private privateUserService: PrivateUserService
  ){}

  /**
   * 
   * @param email 
   */
  private async checkValidEmailAddress(email: string) {
    const regEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i);

    return regEmail.test(email);
  }

  /**
   * 
   * @param password 
   */
  private async checkValidPassword(password: string) {
    const regPassword = new RegExp(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/);

    return regPassword.test(password);
  }

  /**
   * 
   * @param penName 
   */
  private async checkValidPenName(penName: string) {
    const regPenName = new RegExp(/^[a-zA-Z0-9].{3,12}$/);

    return regPenName.test(penName);
  }

  /**
   * return UserJwtTokens
   * @param VerifiedUser 
   */
  private issueTokensToUser(verifiedUser: JwtUserPayload): UserJwtokens {
    return {
      accessToken: this.jwtService.sign(
        Object.assign({ type: ACCESS }, verifiedUser), {
        expiresIn: jwtExpTime.accessToken
      }),
      refreshToken: this.jwtService.sign(
        Object.assign({ type: REFRESH },verifiedUser), {
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
  ): { id: string } | null {
    const decodingUserJwt: any = this.jwtService.decode(refreshToken);
    if(!decodingUserJwt || decodingUserJwt.type !== REFRESH) {
      return null;
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + refreshExpTime > Date.now();

    if(!checkAgent || !checkExpTime) {
      return null;
    } 

    return {
      id: decodingUserJwt.id 
    }
  } 

  /**
   * 
   * @param requiredUserInfo 
   */
  public async signUpUser(
    requiredUserInfo: RequiredUserInfo
  ): Promise<Response> {
    const emailValid: boolean = await this.checkValidEmailAddress(requiredUserInfo.email);
    const passwordValid: boolean = await this.checkValidPassword(requiredUserInfo.password);
    const penNameValid: boolean = await this.checkValidPenName(requiredUserInfo.penName);

    console.log(emailValid, passwordValid, penNameValid);

    if(!emailValid || !passwordValid || !penNameValid) {
      return new Response().error(...CommonErrorMessage.validationError);
    } 
    
    const emailUsed: boolean = await this.privateUserService.checkUsedEmailAddress(requiredUserInfo.email);
    const penNameUsed: boolean = await this.privateUserService.checkPenName(requiredUserInfo.penName);
    
    if(emailUsed || penNameUsed) {
      return new Response().error(...CommonErrorMessage.validationError);
    }

    const resUserResister = await this.privateUserService.registerUser(requiredUserInfo);

    return resUserResister? 
      new Response().body("successs")
      : new Response().error(...SystemErrorMessage.db);
  }

  public async signInUser(
    unverifieduserInfo: UserAuthInfo, 
    userAgent: string
  ): Promise<Response> {

    const { 
      isActive, 
      isNotDormant, 
      countOfFail, 
      userInfo 
    }: ResAuthenticatedUser = await this.privateUserService.authenticateUser(unverifieduserInfo);

    if(countOfFail) {
      return new Response()
        .error(...AuthErrorMessage.failureSignIn(countOfFail));
    }

    if(!isActive) {
      return new Response()
        .error(...AuthErrorMessage.disabledUser);
    }

    if(!isNotDormant) {
      return new Response()
        .error(...AuthErrorMessage.dormantUser);
    }

    if(userInfo) {
      const jwt = await this.issueTokensToUser({
        id: userInfo.userId,
        agent: userAgent
      });

      return new Response().body({
        userInfo,
        jwt
      });
    } 
    
    return new Response().error(...SystemErrorMessage.db);
  }

  /**
   * success시 return null
   * @param accessToken 
   * @param userAgent 
   */
  public validationAccessToken(
    accessToken: string, 
    userAgent: string
  ): TokenVailtionRes | null {
    const decodingUserJwt: any = this.jwtService.decode(accessToken);
    
    if(!decodingUserJwt || decodingUserJwt.type !== ACCESS) {
      return {
        infoFalse: true,
        expFalse: true
      };
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + accessExpTime > Date.now();

    if(!checkAgent || !checkExpTime) {
      return {
        infoFalse: !checkAgent,
        expFalse: !checkExpTime
      }
    } 

    return null;
  } 

  /**
   * 
   * @param accessToken 
   * @param userAgent 
   */
  public validateAccessTokenReturnId(
    accessToken: string,
    userAgent: string
  ): ResValitionAccessToken {
    const decodingUserJwt: any = this.jwtService.decode(accessToken);
    
    if(!decodingUserJwt || decodingUserJwt.type !== ACCESS) {
      return {
        id: null,
        error: {
          infoFalse: true,
          expFalse: true
        }
      };
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + accessExpTime > Date.now();

    if(!checkAgent || !checkExpTime) {
      return {
        id: null,
        error: {
          infoFalse: !checkAgent,
          expFalse: !checkExpTime
        }
      }
    } 

    return {
      id: decodingUserJwt.id
    };
  }

  /**
   * 
   * @param accessToken 
   * @param userAgent 
   */
  public checkAccessToken(
    accessToken: string, 
    userAgent: string
  ): ResCheckAccessToken {
    const result = this.validationAccessToken(accessToken, userAgent);

    let clearToken: boolean = true;
    let response: Response = new Response();

    if(result) {
      clearToken = true;

      if(result.expFalse) {
        response.error(...AuthErrorMessage.exp);
      }

      if(result.infoFalse) {
        response.error(...AuthErrorMessage.info);
      }

    } else {
      clearToken = false;
      response.body("success");
    }

    return {
      response,
      clearToken
    }
  }

  /**
   * return UserJwtokens | null
   * @param refreshToken 
   * @param userAgent 
   */
  public async reissueTokensToUser(
    refreshToken: string, 
    userAgent: string
  ): Promise<UserJwtokens | null> {

    const tokenVailtionRes: { id: string } | null = this.validationRefreshToken(
      refreshToken,
      userAgent
    );

    if(!tokenVailtionRes) {
      return null;
    }

    const userId: string | null = await this.privateUserService.getAuthenticatedUser(tokenVailtionRes.id);

    if(!userId) {
      return null;
    }

    const jwtTokens: UserJwtokens = this.issueTokensToUser({
      id: userId,
      agent: userAgent
    });

    return jwtTokens;
  }

  public async reissueTokens(
    refreshToken: string,
    userAgent: string
  ): Promise<ResReissueTokens> {
    const userJwtTokens: UserJwtokens | null = await this.reissueTokensToUser(refreshToken, userAgent);

    let response = new Response();

    if(userJwtTokens) {
      response.body("success");
    } else {
      response.error(...AuthErrorMessage.info);
    }

    return {
      response,
      userJwt: userJwtTokens
    } 
  }

  /**
   * 
   * @param refreshToken 
   * @param userAgent 
   */
  public async signOutUser(
    refreshToken: string,
    userAgent: string
  ): Promise<boolean> {
    const tokenVailtionRes: { id: string } | null = this.validationRefreshToken(
        refreshToken,
        userAgent
      );

    if(!tokenVailtionRes) {
      return null;
    }

    const resUpdateAccessTime: boolean = 
      await this.privateUserService.updateAccessTime(tokenVailtionRes.id);

    return resUpdateAccessTime;
  }

  /**
   * 
   * @param userInfo 
   * @param accessToken 
   * @param refreshToken 
   * @param userAgent 
   */
  public async withdrawalUser(
    userInfo: UserAuthInfo, 
    accessToken: string, 
    refreshToken: string,
    userAgent: string
  ): Promise<ResWithdrawalUser> {
    const validationAccessToken = this.validationAccessToken(accessToken, userAgent);
    if(validationAccessToken) {
      return {
        success: false,
        error: validationAccessToken
      }
    }
    const tokenVailtionRes: { id: string } | null = this.validationRefreshToken(
      refreshToken,
      userAgent
    );

    if(tokenVailtionRes) {
      const resDeleteUser = await this.privateUserService.withdrawalUser(
        Object.assign(userInfo, {id: tokenVailtionRes.id})
      );

      return resDeleteUser;
    }
    
    return {
      success: false,
      error: {
        cookie: false
      }
    }
  }

  /**
   * 
   * @param accessToken 
   * @param userAgent 
   * @param targetEmail 
   */
  public async activateUser(
    accessToken: string, 
    userAgent: string, 
    targetEmail: string
  ) {
    const decodingJwt: ResValitionAccessToken = this.validateAccessTokenReturnId(accessToken, userAgent);

    if(!decodingJwt.id) {
      return {
        success: false,
        error: decodingJwt.error
      }
    }
    const checkedAdmin: boolean = await this.privateUserService.checkAdmin(decodingJwt.id);
    
    if(!checkedAdmin) {
      return {
        success: false,
        error: {
          admin: false
        }
      }
    }

    const result = await this.privateUserService.changeActivationUser(
      targetEmail,
      true
    );

    return result;
  }

  /**
   * 
   * @param accessToken 
   * @param userAgent 
   */
  public async simpleSignInUser(
    accessToken: string,
    userAgent: string
  ): Promise<ResCheckAccessToken> {
    const { id, error } = this.validateAccessTokenReturnId(accessToken, userAgent);

    const response: Response = new Response();
    let clearToken = false;

    if(error) {
      if(error.expFalse) {
        response.error(...AuthErrorMessage.exp);
      } else {
        response.error(...AuthErrorMessage.info);
      }
      response;
    }

    const result = await this.privateUserService.getUserInfo(id);

    if(result.error) {
      response.error(...AuthErrorMessage.failureSignIn(-1));
    } else {
      response.body(result.userInfo);
      clearToken = true;
    }

    return {
      response,
      clearToken
    }
  }

  public async checkUserIdNProfileId(userId: string, profileId: string): Promise<boolean> {
    const userInfo: UserIdList = await this.privateUserService.getUserIdNProfileId(userId);

    if(userInfo) {
      return userInfo.profileId === profileId? true : false;
    }

    return false;
  }

  public async checkUserIdNPenName(userId: string, penName: string): Promise<boolean> {
    const userInfo: UserIdNPenName = await this.privateUserService.getUserIdNPenName(userId);

    if(userInfo) {
      return userInfo.penName === penName? true : false;
    }

    return false;
  }
}
