import { Injectable, Logger } from '@nestjs/common';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { InfoToFindUserProfile, UserStatusData } from './user.type';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollow } from 'src/entities/user/user-follow.entity';
import { UserFollowRepository } from './repositories/user-follow.repository';
import { UserBlockingRepository } from './repositories/user-blocking.repository';
import { Connection } from 'typeorm';
import { Response, CommonErrorMessage } from 'src/utils/common/response.util';


@Injectable()
export class UserService {
  constructor(
    private connection: Connection,
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
  public async findOneUserProfile(infoToFindUserProfile : InfoToFindUserProfile) {
    return await this.userProfileRepository.findOne({
      where: infoToFindUserProfile
    });
  }

  /**
   * user status 찾기
   * @param profileId 
   * @param relativeId 
   */

  private async findOneUserProfileStatus(InfoToFindUserProfile: InfoToFindUserProfile) {
    return await this.userProfileRepository.findOne({
      where: InfoToFindUserProfile,
      relations: ["userStatus"]
    });
  }

  /**
   * follower 찾기
   * @param profileId 
   * @param relativeId 
   */
  private async findOneUserFollower(profileId: string, relativeId: string) {
    return this.userFollowRepository.findOne({
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
  }

  /**
   * follower List 찾기
   * @param profileId 
   */
  private async findUserFollower(profileId: string) {
    return this.userFollowRepository
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
  private async findOneUserFollowing(profileId: string, relativeId: string) {
    return this.userFollowRepository.findOne({
      relations: ["userProfile", "relativeProfile"],
      where: {
        userProfile: {
          id: relativeId
        },
        relativeProfile: {
          id: profileId
        }
      }
    });;
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

  public async getUserProfile(userInfo: { id?: string; penName?: string;}): Promise<Response> {
    const userProfile = await this.findOneUserProfile(userInfo);

    return userProfile? new Response().body(userProfile)
      : new Response().error(...CommonErrorMessage.notFound).notFound();
  }
             
  /**
   * 중복 유무 확인
   * @param penName 
   */
  public async checkPenName(penName: string): Promise<boolean> {
    const userProfile = await this.findOneUserProfile({ penName });

    return userProfile? true : false;
  }

  /**
   * profile id 찾기
   * @param penName 
   */
  public async findUserProfileId(penName: string): Promise<string | null> {
    const userProfile = await this.findOneUserProfile({ penName });

    return userProfile? userProfile.id : null;
  }
 
  /**
   * user Status 찾기
   * @param infoToFindUserProfile 
   */
  public async findUserStatus(infoToFindUserProfile: InfoToFindUserProfile): Promise<UserStatusData | null> {
    const userProfile = await this.findOneUserProfileStatus(infoToFindUserProfile); 
    
    if(!userProfile) {
      return null;
    }

    const userStatus = userProfile.userStatus;
    
    return {
      lastAccessTime: userStatus.lastAccessTime,
      isNotDormant: userStatus.isNotDormant,
      isActive: userStatus.isActive
    };
  }

  /**
   * follower check
   * @param profileId 
   * @param relativeId 
   */
  public async checkFollower(profileId: string, relativeId: string) {
    const userFollower = await this.findOneUserFollower(profileId, relativeId);

    return userFollower? true : false;
  }

  /**
   * following check
   * @param profileId 
   * @param relativeId 
   */
  public async checkFollowing(profileId: string, relativeId: string) {
    const userFollowing = await this.findOneUserFollowing(profileId, relativeId);

    return userFollowing? true : false;
  }

}

