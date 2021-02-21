import { PublicUserInfo } from "src/types/public";

export type ValidInfo = {
  emailValid: boolean,
  passwodValid: boolean
}

export type UsedEmail = {
  emailUsed: boolean
}

export type ClientData = {
  email: string,
  password: string,
  agent: any
}

export type UnverifiedUser = {
  email: string;
  password: string;
}

export type Register = {
  email: string;
  name: string;
  password: string;
}

export type UserInfo = {
  uuid: string;
  email: string;
  name: string;
}

export interface BaseUserInfo extends PublicUserInfo {
  uuid: string;
}

export type LoginUserInfo = {
  uuid: string;
  email: string;
  name: string;
  jwt: {
    access: string;
    refresh: string;
  };
  lastLogin: Date;
}