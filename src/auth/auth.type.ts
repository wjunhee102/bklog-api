import { PublicUserInfo } from "src/types/public";
import { UserInfo } from "src/user/user.type";

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
  userInfo: UserInfo | null;
  jwt: UserJwtokens | null;
  countFail: number;
  isActive: boolean;
}