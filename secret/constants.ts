import { SignOptions } from "jsonwebtoken";

export const jwtConstants = {
  secret: "secretKey",
}; 

export const jwtSignOptions: SignOptions = {
  algorithm: "HS256"
}

/**
 * Access : 2h
 * Refresh: 1일
 */
export const jwtExpTime = {
  refreshToken: "1d",
  accessToken: "2h"
}

export const accessExpTime = 1000 * 60 * 60 * 1 * 1;
export const refreshExpTime = 1000 * 60 * 60 * 24 * 1;
export const imminentExpTime = 1000 * 60 * 60 * 24 * 1;

export const cookieConstants = "secretKey";

/**
 * 쿠키 발행 시간 하루
 */
export const cookieExpTime =  {
  access: 1000 * 60 * 60 * 24 * 1,
  refresh: 1000 * 60 * 60 * 24 * 1
}

/**
 * 발행 시간 
 * @param expTime 
 * secure 설정시 safari에는 쿠키 설정이 안됨
 */
export const createCookieOption = (domain: string = "localhost") => (expTime:number) => {
  return {
    httpOnly: true,
    maxAge: expTime,
    signed: true,
    domain,
    sameSite: "none",
    secure: true
  }
} 




