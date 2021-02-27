import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserProfile } from 'src/entities/user/user-profile.entity';


@Injectable()
export class UserService {
  constructor(
    private readonly userProfileRespository: UserProfileRepository
  ){}

  /**
   * profile 찾기
   * @param penName 
   */
  private async findOneUserProfile(penName: string): Promise<UserProfile | null> {
    const userProfile: UserProfile | null = await this.userProfileRespository.findOne({
      where: {
        penName
      }
    });

    return userProfile;
  }

  /**
   * 중복 유무 확인
   * @param penName 
   */
  public async checkPenName(penName: string): Promise<boolean> {
    const userProfile: UserProfile | null = await this.findOneUserProfile(penName);

    return userProfile? true : false;
  }

}

