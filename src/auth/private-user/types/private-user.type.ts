export type UserAuthInfo = {
  email: string;
  password: string;
}

export type InfoToFindUser = {
  email?: string;
  id?: string; 
}

export type UserPrivacyInfo = {
  country?: string;
  state?: string;
  city?: string;
  detailedAddress?: string;
  phoneNumber?: string;
}

export type RequiredUserInfo = UserAuthInfo & {
  penName: string;
  name: string;
}

export type IdentifyUser = {
  email: string;
  name: string;
  penName: string;
  userId: string;
  profileId: string;
  userPhoto: string;
}

export type ResAuthenticatedUser = {
  userInfo: IdentifyUser | null;
  countOfFail: number;
  isActive: boolean;
  isNotDormant: boolean;
}

export type ResDeleteUser = {
  success: boolean;
  error: {
    idValid: boolean;
    emailValid: boolean;
    passwordValid: boolean;
  };
}