import { SignOptions } from "jsonwebtoken";

export const jwtConstants = {
  secret: "secretKey",
}; 

export const jwtSignOptions: SignOptions = {
  algorithm: "HS256"
}

/**
 * Access : 30분
 * Refresh: 7일
 */
export const jwtExpTime = {
  refreshToken: "7d",
  accessToken: "1h"
}

export const cookieConstants = "secretKey";

/**
 * 쿠키 발행 시간
 */
export const cookieExpTime =  {
  access: 1000 * 60 * 60,
  refresh: 1000 * 60 * 60 * 24 * 7
}

/**
 * 발행 시간 
 * @param expTime 
 */
export const createCookieOption = (expTime:number) => {
  return {
    httpOnly: true,
    expires: new Date(Date.now() + expTime),
    signed: true
  }
} 




