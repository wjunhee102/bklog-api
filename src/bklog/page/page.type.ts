import { UserIdList } from "src/auth/private-user/types/private-user.type";
import { UserProfile } from "src/entities/user/user-profile.entity";

export interface InfoToFindPage {
  id?: string;
  profileId?: string;
  userId?: string;
  disclosureScope?: number;
}

export interface ReqCreatePage {
  profileId: string;
  title: string;
  disclosureScope: number;
}

export interface RequiredBklogInfo extends UserIdList {
  title: string;
  disclosureScope: number;// 0: 개인, 1: following, 2: org, 3: following || org, 4: public
}

export interface RequiredPageInfo extends RequiredBklogInfo {
  userProfile: UserProfile;
}

export interface PageInfoList {
  id: string;
  title: string;
  disclosureScope: number;
}

export interface PageUserInfo {
  penName?: string;
  id?: string;
}