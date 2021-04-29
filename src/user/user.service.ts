import { Injectable, Logger } from '@nestjs/common';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindUserProfile, UserStatusData } from './user.type';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollow } from 'src/entities/user/user-follow.entity';
import { UserFollowRepository } from './repositories/user-follow.repository';
import { UserBlockingRepository } from './repositories/user-blocking.repository';


@Injectable()
export class UserService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly userFollowRepository: UserFollowRepository,
    private readonly userBlockingRepository: UserBlockingRepository
  ){}

  /**
   * user following 추가
   * @param profileId 
   * @param relativeId 
   */
  private async insertUserFollow(userProfile: UserProfile, relativeProfile: UserProfile): Promise<boolean> {
    try {
      const userFollow: UserFollow = await this.userFollowRepository.create({
        userProfile,
        relativeProfile
      });

      await this.userFollowRepository.save(userFollow);

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
  private async findOneUserFollower(profileId: string, relativeId: string): Promise<UserFollow | null> {
    const userFollower: UserFollow = await this.userFollowRepository.findOne({
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
  private async findUserFollower(profileId: string): Promise<UserFollow[]> {
    return await this.userFollowRepository
      .createQueryBuilder("user-follow")
      .leftJoinAndSelect(
        "userFollow.relativeProfile",
        "user-profile"
      )
      .where("userFollow.userProfileId = :profileId", { profileId })
      .select("userFollow.relative")
      .getMany();
  }

  /**
   * following 찾기
   * @param profileId 
   * @param relativeId 
   */
  private async findOneUserFollowing(profileId: string, relativeId: string): Promise<UserFollow> {
    const userFollowing: UserFollow = await this.userFollowRepository.findOne({
      relations: ["userProfile", "relativeProfile"],
      where: {
        userProfile: {
          id: relativeId
        },
        relativeProfile: {
          id: profileId
        }
      }
    });

    return userFollowing;
  }

  /**
   * following List 찾기
   * @param profileId 
   */
  private async findUserFollowing(profileId: string): Promise<UserFollow[]> {
    return await this.userFollowRepository
      .createQueryBuilder("user-follow")
      .leftJoinAndSelect(
        "userFollow.userProfile",
        "user-profile"
      )
      .where("userFollow.relativeProfileId = :profileId", { profileId })
      .select("userFollow.userProfile")
      .getMany();
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
    const userFollower: UserFollow | null = await this.findOneUserFollower(profileId, relativeId);

    return userFollower? true : false;
  }

  /**
   * following check
   * @param profileId 
   * @param relativeId 
   */
  public async checkFollowing(profileId: string, relativeId: string) {
    const userFollowing: UserFollow | null = await this.findOneUserFollowing(profileId, relativeId);

    return userFollowing? true : false;
  }


}

