import { PublicUserInfo } from "src/types/public";

export type SignInUser = {
  email: string;
  password: string;
}

export interface JwtUserPayload extends PublicUserInfo {
  agent: string;
}

export type UserJwtTokens = {
  accessToken: string;
  refreshToken: string; 
}

export interface DecodeJwt extends JwtUserPayload {
  iat: number,
  exp: number 
}