export type Login = {
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

export type LoginUserInfo = {
  uuid: string;
  email: string;
  name: string;
  jwt: string;
  lastLogin: Date;
}