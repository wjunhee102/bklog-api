export interface UserProfileInfo {
  penName: string;
  bio: string;
}

export interface InfoToFindUserProfile {
  id?: string;
  penName?: string;
}

export interface UserStatusData {
  lastAccessTime: Date;
  isNotDormant: boolean;
  isActive: boolean;
}