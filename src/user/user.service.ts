import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindUserProfile } from './user.type';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollowingRepository } from './repositories/user-following.repository';
import { UserFollowerRepository } from './repositories/user-follower.repository';


@Injectable()
export class UserService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly userFollowing: UserFollowingRepository,
    private readonly userFollower: UserFollowerRepository
  ){}

  /**
   * profile 찾기
   * @param penName 
   */
  private async findOneUserProfile(infoToFindUserProfile : InfoToFindUserProfile): Promise<UserProfile | null> {
    const userProfile: UserProfile | null = await this.userProfileRepository.findOne({
      where: infoToFindUserProfile
    });

    return userProfile;
  }

  /**
   * 중복 유무 확인
   * @param penName 
   */
  public async checkPenName(penName: string): Promise<boolean> {
    const userProfile: UserProfile | null = await this.findOneUserProfile({ penName });

    return userProfile? true : false;
  }

  public async findUserProfileId(penName: string): Promise<string> {
    const userProfile: UserProfile | null = await this.findOneUserProfile({ penName });

    return userProfile? userProfile.id : null;
  }

}

