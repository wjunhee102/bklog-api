import { Injectable, Logger } from '@nestjs/common';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindUserProfile, UserStatusData } from './user.type';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollowingRepository } from './repositories/user-following.repository';
import { UserFollowerRepository } from './repositories/user-follower.repository';
import { UserFollower } from 'src/entities/user/user-follower.entity';
import { UserFollowing } from 'src/entities/user/user-following.entity';


@Injectable()
export class UserService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly userFollowingRepository: UserFollowingRepository,
    private readonly userFollowerRepository: UserFollowerRepository
  ){}

  /**
   * user following 추가
   * @param profileId 
   * @param relativeId 
   */
  private async insertUserFollowing(userProfile: UserProfile, relativeProfile: UserProfile): Promise<boolean> {
    try {
      const userFollowing: UserFollowing = await this.userFollowingRepository.create({
        userProfile,
        relativeProfile
      });

      await this.userFollowingRepository.save(userFollowing);

      return true;
    } catch(e) {
      Logger.error(e);
      return false;
    }
  }
  
  /**
   * user follower 추가
   * @param profileId 
   * @param relativeId 
   */
  private async insertUserFollower(userProfile: UserProfile, relativeProfile: UserProfile): Promise<boolean> {
    try {
      const userFollower: UserFollower = await this.userFollowerRepository.create({
        userProfile,
        relativeProfile
      });

      await this.userFollowerRepository.save(userFollower);

      return true;
    } catch(e) {
      Logger.error(e);
      return false;
    }
  }

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
   * user status 찾기
   * @param profileId 
   * @param relativeId 
   */

  private async findOneUserProfileStatus(InfoToFindUserProfile: InfoToFindUserProfile): Promise<UserProfile | null>{
    const userProfile: UserProfile | null = await this.userProfileRepository.findOne({
      where: InfoToFindUserProfile,
      relations: ["userStatus"]
    });

    return userProfile;
  }

  /**
   * follower 찾기
   * @param profileId 
   * @param relativeId 
   */
  private async findOneUserFollower(profileId: string, relativeId: string): Promise<UserFollower | null> {
    const userFollower: UserFollower = await this.userFollowingRepository.findOne({
      relations: ["userProfile", "relativeProfile"],
      where: {
        userProfile: {
          id: profileId
        },
        relativeProfile: {
          id: relativeId
        }
      }
    });

    return userFollower;
  }

  /**
   * follower List 찾기
   * @param profileId 
   */
  private async findUserFollower(profileId: string): Promise<UserFollower[]> {
    return await this.userFollowerRepository.find({
      relations:["userProfile", "relativeProfile"],
      where: {
        userProfile: {
          id: profileId
        } 
      },
      order: {
        createdDate: "ASC"
      }
    });
  }

  /**
   * following 찾기
   * @param profileId 
   * @param relativeId 
   */
  private async findOneUserFollowing(profileId: string, relativeId: string): Promise<UserFollowing> {
    const userFollowing: UserFollowing = await this.userFollowingRepository.findOne({
      relations: ["userProfile", "relativeProfile"],
      where: {
        userProfile: {
          id: profileId
        },
        relativeProfile: {
          id: relativeId
        }
      }
    });

    return userFollowing;
  }

  /**
   * following List 찾기
   * @param profileId 
   */
  private async findUserFollowing(profileId: string): Promise<UserFollowing[]> {
    return await this.userFollowingRepository.find({
      relations:["userProfile"],
      where: {
        userProfile: {
          id: profileId
        } 
      },
      order: {
        createdDate: "ASC"
      }
    });
  }

  public async getUserProfile(id: string): Promise<UserProfile | null> {
    return await this.findOneUserProfile({ id });
  }

  /**
   * 중복 유무 확인
   * @param penName 
   */
  public async checkPenName(penName: string): Promise<boolean> {
    const userProfile: UserProfile | null = await this.findOneUserProfile({ penName });

    return userProfile? true : false;
  }

  /**
   * profile id 찾기
   * @param penName 
   */
  public async findUserProfileId(penName: string): Promise<string> {
    const userProfile: UserProfile | null = await this.findOneUserProfile({ penName });

    return userProfile? userProfile.id : null;
  }
 
  /**
   * user Status 찾기
   * @param infoToFindUserProfile 
   */
  public async findUserStatus(infoToFindUserProfile: InfoToFindUserProfile): Promise<UserStatusData | null> {
    const userProfile: UserProfile | null = await this.findOneUserProfileStatus(infoToFindUserProfile); 
    
    if(!userProfile) {
      return null;
    }
    const userStatus = userProfile.userStatus;
    delete userStatus.id;
    
    return userStatus;
  }

  /**
   * follower check
   * @param profileId 
   * @param relativeId 
   */
  public async checkFollower(profileId: string, relativeId: string) {
    const userFollower: UserFollower | null = await this.findOneUserFollower(profileId, relativeId);

    return userFollower? true : false;
  }

  /**
   * following check
   * @param profileId 
   * @param relativeId 
   */
  public async checkFollowing(profileId: string, relativeId: string) {
    const userFollowing: UserFollowing | null = await this.findOneUserFollowing(profileId, relativeId);

    return userFollowing? true : false;
  }


}

