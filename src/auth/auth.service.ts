import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtExpTime, accessExpTime, refreshExpTime } from 'secret/constants';
import { JwtUserPayload, TokenVailtionRes, ResSignInUser, UserJwtokens, ResSignUpUser, ResWithdrawalUser, ResValitionAccessToken, ClientUserInfo, ACCESS, REFRESH } from './auth.type';
import { UserAuthInfo } from './private-user/types/private-user.type';
import { RequiredUserInfo, ResAuthenticatedUser } from './private-user/types/private-user.type';
import { PrivateUserService } from './private-user/private-user.service';

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
  ): { uuid: string } | null {
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
      uuid: decodingUserJwt.uuid 
    }
  } 

  /**
   * 
   * @param requiredUserInfo 
   */
  public async signUpUser(
    requiredUserInfo: RequiredUserInfo
  ): Promise<ResSignUpUser> {
    const emailValid: boolean = await this.checkValidEmailAddress(requiredUserInfo.email);
    const passwordValid: boolean = await this.checkValidPassword(requiredUserInfo.password);
    const penNameValid: boolean = await this.checkValidPenName(requiredUserInfo.penName);

    console.log(emailValid, passwordValid, penNameValid);

    if(!emailValid || !passwordValid || !penNameValid) {
      return {
        success: false,
        error: {
          emailValid: !emailValid,
          passwordValid: !passwordValid,
          penNameValid: !penNameValid,
          emailUsed: false,
          penNameUsed: false
        }
      }
    } 
    
    const emailUsed: boolean = await this.privateUserService.checkUsedEmailAddress(requiredUserInfo.email);
    const penNameUsed: boolean = await this.privateUserService.checkPenName(requiredUserInfo.penName);
    
    if(emailUsed || penNameUsed) {
      return {
        success: false,
        error: {
          emailValid: !emailValid,
          passwordValid: !passwordValid,
          penNameValid: !penNameValid,
          emailUsed,
          penNameUsed
        }
      }
    }

    const resUserResister = await this.privateUserService.registerUser(requiredUserInfo);

    return {
      success: resUserResister
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
    const resSignInUser: ResSignInUser = {
      success: false,
      userInfo: null,
      jwt: null,
      error: null
    }

    const error = {
      countOfFail: 0,
      isActive: false,
      isNotDormant: false
    }
    const authenticatedUser: ResAuthenticatedUser = await this.privateUserService.authenticateUser(unverifieduserInfo);

    error.countOfFail = authenticatedUser.countOfFail;
    error.isActive = authenticatedUser.isActive;
    error.isNotDormant = authenticatedUser.isNotDormant;
    resSignInUser.error = error;

    if(authenticatedUser.userInfo) {

      resSignInUser.userInfo = authenticatedUser.userInfo;

      resSignInUser.jwt = await this.issueTokensToUser({
        uuid: authenticatedUser.userInfo.userId,
        agent: userAgent
      });
      resSignInUser.success = true;
      resSignInUser.error = null;
    } 

    return resSignInUser;
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

    console.log(decodingUserJwt);
    
    if(!decodingUserJwt || decodingUserJwt.type !== ACCESS) {
      return {
        infoFalse: true,
        expFalse: true
      };
    }

    const checkAgent: boolean = decodingUserJwt.agent === userAgent;
    const checkExpTime = decodingUserJwt.exp * 1000 + accessExpTime > Date.now();

    console.log(checkAgent, checkExpTime);

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
        uuid: null,
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
        uuid: null,
        error: {
          infoFalse: !checkAgent,
          expFalse: !checkExpTime
        }
      }
    } 

    return {
      uuid: decodingUserJwt.uuid
    };
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

    const userId: string | null = await this.privateUserService.getAuthenticatedUser(tokenVailtionRes.uuid);

    if(!userId) {
      return null;
    }

    const jwtTokens: UserJwtokens = this.issueTokensToUser({
      uuid: userId,
      agent: userAgent
    });

    return jwtTokens;
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
    const tokenVailtionRes: { uuid: string } | null = this.validationRefreshToken(
        refreshToken,
        userAgent
      );

    if(!tokenVailtionRes) {
      return null;
    }

    const resUpdateAccessTime: boolean = 
      await this.privateUserService.updateAccessTime(tokenVailtionRes.uuid);

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
    const tokenVailtionRes: { uuid: string } | null = this.validationRefreshToken(
      refreshToken,
      userAgent
    );

    if(tokenVailtionRes) {
      const resDeleteUser = await this.privateUserService.withdrawalUser(
        Object.assign(userInfo, {id: tokenVailtionRes.uuid})
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
  public async activateUser (
    accessToken: string, 
    userAgent: string, 
    targetEmail: string
  ) {
    const decodingJwt: ResValitionAccessToken = this.validateAccessTokenReturnId(accessToken, userAgent);

    if(!decodingJwt.uuid) {
      return {
        success: false,
        error: decodingJwt.error
      }
    }
    const checkedAdmin: boolean = await this.privateUserService.checkAdmin(decodingJwt.uuid);
    
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
  public async simpleSignInUser (
    accessToken: string,
    userAgent: string
  ) {
    const decodingJwt = this.validateAccessTokenReturnId(accessToken, userAgent);

    if(!decodingJwt.uuid) {
      return {
        success: false,
        userInfo: null,
        error: decodingJwt.error
      }
    }

    const result = this.privateUserService.getUserInfo(decodingJwt.uuid);

    return result;
  }
}
