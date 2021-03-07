import { PublicUserInfo } from "src/types/public";
import { IdentifyUser, ResDeleteUser } from "./private-user/types/private-user.type";

export interface JwtUserPayload {
  uuid: string;
  agent: string;
}

export interface UserJwtokens {
  accessToken: string;
  refreshToken: string; 
}

export interface DecodeJwt extends JwtUserPayload {
  iat: number,
  exp: number 
}

export type TokenVailtionRes = {
  info: boolean,
  exp: boolean
} | null;

export interface ResRegisterUser {
  success: boolean;
  error: {
    emailValid: boolean;
    passwordValid: boolean;
    emailUsed: boolean;
  } | null;
}

export interface ResAuthToUser {
  userInfo: PublicUserInfo,
  jwt: UserJwtokens
};

export interface ResSignInUser {
  success: boolean;
  userInfo: IdentifyUser | null;
  jwt?: UserJwtokens | null;
  error: {
    countOfFail: number;
    isActive: boolean;
    isNotDormant: boolean;
  } | string | null;
}

export interface ResSignUpUser {
  success: boolean;
  error?: {
    emailValid: boolean;
    passwordValid: boolean;
    penNameValid: boolean;
    emailUsed: boolean;
    penNameUsed: boolean;
  }
}

export type ResWithdrawalUser = ResDeleteUser 
| {
  success: boolean;
  error: TokenVailtionRes;
} 
| { 
  success: boolean;
  error: {
    cookie: false;
  } 
};

export type ResActivateUser = {
  success: boolean;
  error: {
    accessToken: boolean;
    emailValid: boolean;
    database: boolean;
  } | null;
}

export interface ResValitionAccessToken {
  uuid: string | null;
  error?: CookieAuthenticationFailure;
}

export interface CookieAuthenticationFailure {
  info: boolean;
  exp: boolean;
}

export interface ClientUserInfo {
  userId: string;
}

export interface TargetUser {
  email: string;
}