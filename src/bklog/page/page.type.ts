import { UserIdList } from "src/auth/private-user/types/private-user.type";
import { Page } from "src/entities/bklog/page.entity";
import { UserProfile } from "src/entities/user/user-profile.entity";

export interface InfoToFindPage {
  id?: string;
  profileId?: string;
  userId?: string;
  disclosureScope?: number;
}

export interface InfoToFindPageEditor {
  page?: Page;
  userProfile?: UserProfile;
}

export interface ReqCreatePage {
  title: string;
  disclosureScope: number;
}

export interface RequiredBklogInfo extends UserIdList {
  title: string;
  disclosureScope: number;// 0: 삭제 예정, 1: 개인, 2: following, 3: org, 4: following || org, 5: public;
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