export interface UserAuthInfo {
  email: string;
  password: string;
}

export interface InfoToFindUser {
  email?: string;
  id?: string; 
}

export interface UserPrivacyInfo {
  country?: string;
  state?: string;
  city?: string;
  detailedAddress?: string;
  phoneNumber?: string;
}

export interface RequiredUserInfo extends UserAuthInfo {
  penName: string;
  firstName: string;
  lastName: string;
  bio: string;
}

export interface IdentifyUser {
  email: string;
  firstName: string;
  lastName: string;
  penName: string;
  userId: string;
  profileId: string;
  userPhoto: string;
  bio: string;
}

export interface ResAuthenticatedUser {
  userInfo: IdentifyUser | null;
  countOfFail: number;
  isActive: boolean;
  isNotDormant: boolean;
}

export interface ResDeleteUser {
  success: boolean;
  error: {
    idValid: boolean;
    emailValid: boolean;
    passwordValid: boolean;
  };
}

export interface UserIdList {
  profileId: string;
  userId: string;
}