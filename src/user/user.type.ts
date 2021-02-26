import { PublicUserInfo } from "src/types/public";

export type ValidInfo = {
  emailValid: boolean,
  passwordValid: boolean
}

export type UsedEmail = {
  emailUsed: boolean
}

export type ClientData = {
  email: string,
  password: string,
  agent: any
}

export type UserAuthInfo = {
  email: string;
  password: string;
}

export type CountOfFailures = {
  count: number
}

export interface RegiInfoUser extends UserAuthInfo {
  name: string;
}

export interface UserInfo extends PublicUserInfo {
  uuid: string;
}
// 위와 동일
export interface BaseUserInfo extends PublicUserInfo {
  uuid: string;
}

export type ResIdentifyUser = {
  userInfo: UserInfo | null;
  count: number;
  isActive: boolean;
  isNotDormant: boolean;
}

export type UserProfileInfo = {
  name: string;
}