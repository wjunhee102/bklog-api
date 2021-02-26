import { UserProfileInfo } from "src/user/user.type";

export type UserAuthInfo = {
  email: string;
  password: string;
}

export type UserPrivacyInfo = {
  country?: string;
  state?: string;
  city?: string;
  detailedAddress?: string;
  phoneNumber?: string;
}

export type RequiredUserInfo = {
  profile: UserProfileInfo,
  auth: UserAuthInfo,
  privacy?: UserPrivacyInfo,
  name: string
}