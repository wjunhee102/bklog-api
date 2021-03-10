import { UserIdList } from "src/auth/private-user/types/private-user.type";

export interface InfoToFindPage {
  id?: string;
  profileId?: string;
  userId?: string;
  private?: number;
}

export interface RequiredPageInfo extends UserIdList {
  title: string;
  private: number;// 0, 1, 2, 3, 4
}

export interface PageInfoList {
  pageId: string;
  title: string;
}