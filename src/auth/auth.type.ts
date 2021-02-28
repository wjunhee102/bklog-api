import { PublicUserInfo } from "src/types/public";
import { IdentifyUser, ResDeleteUser } from "./private-user/types/private-user.type";

export interface JwtUserPayload {
  uuid: string;
  agent: string;
}

export type UserJwtokens = {
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

export type ResRegisterUser = {
  success: boolean;
  error: {
    emailValid: boolean;
    passwordValid: boolean;
    emailUsed: boolean;
  } | null;
}

export type ResAuthToUser = {
  userInfo: PublicUserInfo,
  jwt: UserJwtokens
};

export type ResSignInUser = {
  success: boolean;
  userInfo: IdentifyUser | null;
  jwt: UserJwtokens | null;
  error: {
    countOfFail: number;
    isActive: boolean;
    isNotDormant: boolean;
  } | null;
}

export type ResSignUpUser = {
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

export type ResValitionAccessToken = {
  uuid: string | null;
  error?: CookieAuthenticationFailure;
}

export type CookieAuthenticationFailure = {
  info: boolean;
  exp: boolean;
}

export type ClientUserInfo = {
  userId: string;
}

export type TargetUser = {
  email: string;
}