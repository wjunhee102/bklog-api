import { Injectable, Logger } from '@nestjs/common';
import { UserPrivacyRepository } from './repositories/user-privacy.repository';
import { UserAuthInfo } from 'src/user/user.type';
import * as Bcrypt from 'bcryptjs';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserProfileRepository } from 'src/user/repositories/user-profile.repository';
import { UserStatusRepository } from 'src/user/repositories/user-status.repository';
import { RequiredUserInfo } from './types/private-user.type';
import { UserStatus } from 'src/entities/user/user-status.entity';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserPrivacy } from './entities/user-privacy.entity';
import { Token } from 'src/util/token.util';

@Injectable()
export class PrivateUserService {
  constructor(
    private readonly userPrivacyRepository: UserPrivacyRepository,
    private readonly userRepository: UserRepository,
    private readonly userAuthRepository: UserAuthRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userStatusRepository: UserStatusRepository
  ){}

  private regEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i);
  private regPassword = new RegExp(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/);

  private async findOneUser(email: string) {
    return this.userRepository.find({
      where: {
        email
      }
    })
  };
  
  private async createUser(userInfo: RequiredUserInfo) {
    try {
      
      const status: UserStatus = await this.userStatusRepository.create();

      await this.userStatusRepository.save(status);

      const profile: UserProfile = await this.userProfileRepository.create();

      profile.id = Token.getUUID();
      profile.penName = userInfo.profile.name;
      profile.userStatus = status;

      await this.userProfileRepository.save(profile);

      const privacy: UserPrivacy = await this.userPrivacyRepository.create();
      
      await this.userPrivacyRepository.save(privacy);

      const auth: UserAuth = await this.userAuthRepository.create();

      const salt: string = await Bcrypt.genSalt(10);
      const password: string = await Bcrypt.hash(userInfo.auth.password, salt);

      auth.password = password;
      auth.userPrivacy = privacy;

      await this.userAuthRepository.save(auth);

      const user: User = await this.userRepository.create();

      user.id = Token.getUUID();
      user.name = userInfo.name;
      user.email = userInfo.auth.email;
      user.userAuth = auth;
      user.userProfile = profile;
      user.UserStatus = status;

      await this.userRepository.save(user);

      return true;
  
    } catch(e) {
      Logger.error(e);

      return false;
    }

  }
}
