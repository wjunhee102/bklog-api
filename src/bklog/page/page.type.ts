import { UserIdList } from "src/auth/private-user/types/private-user.type";

export interface InfoToFindPage {
  id?: string;
  profileId?: string;
  userId?: string;
  private?: number;
}

export interface RequiredPageInfo extends UserIdList {
  title: string;
}