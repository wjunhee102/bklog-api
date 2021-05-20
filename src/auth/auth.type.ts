import { PublicUserInfo } from "src/types/public";
import { ResDeleteUser } from "./private-user/types/private-user.type";

export const ACCESS_TOKEN = "AID" as const;
export const REFRESH_TOKEN = "RID" as const;

export const ACCESS = "AC";
export const REFRESH = "RF";

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

export type TokenVailtionType = {
  infoFalse: boolean,
  expFalse: boolean
}

export type TokenVailtionRes = TokenVailtionType | null;

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


// 다른 명칭으로 바꾸거나 좀 더 구체화 시켜야 함.
interface IdentifyUser {
  email: string;
  firstName: string;
  lastName: string;
  penName: string;
  profileId: string;
  userPhoto: string;
  bio: string;
}

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
  infoFalse: boolean;
  expFalse: boolean;
}

export interface ClientUserInfo {
  userId: string;
}

export interface TargetUser {
  email: string;
}