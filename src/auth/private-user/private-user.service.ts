import { Injectable, Logger } from '@nestjs/common';
import { UserPrivacyRepository } from './repositories/user-privacy.repository';
import * as Bcrypt from 'bcryptjs';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserProfileRepository } from 'src/user/repositories/user-profile.repository';
import { UserStatusRepository } from 'src/user/repositories/user-status.repository';
import { UserAuthInfo, RequiredUserInfo, ResAuthenticatedUser, InfoToFindUser, ResDeleteUser } from './types/private-user.type';
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

  /**
   * user 정보 찾기
   * @param email 
   */
  private async findOneUser(userInfo: InfoToFindUser) {
    return await this.userRepository.findOne({
      where: userInfo
    })
  };

  /**
   * 
   * @param userId 
   */
  private async findOneUserAuth(userInfo: InfoToFindUser): Promise<User> {
    return await this.userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.userAuth", "user-auth")
    .leftJoinAndSelect("user.userProfile", "user-profile")
    .leftJoinAndSelect("user.userStatus", "user-status")
    .where(userInfo)
    .getOne();
  }

  private async saveUser(user: User) {
    try {
      await this.userRepository.save(user);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async saveUserProfile(userProfile: UserProfile): Promise<boolean> {
    try {
      await this.userProfileRepository.save(userProfile);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async saveUserAuth(userAuth: UserAuth): Promise<boolean> {
    try {
      await this.userAuthRepository.save(userAuth);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }

  private async saveUserStatus(userStatus: UserStatus): Promise<boolean> {
    try {
      await this.userStatusRepository.save(userStatus);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  }
  
  private async saveUserPrivacy(userPrivacy: UserPrivacy): Promise<boolean> {
    try {
      await this.userPrivacyRepository.save(userPrivacy);

      return true;
    } catch(e) {
      Logger.error(e);

      return false;
    }
  } 

  /**
   * password  비교
   * @param password 
   * @param encryptedPassword 
   */
  private async comparePassword(
    password: string, 
    encryptedPassword: string
  ): Promise<boolean> {
    const resCompare = await Bcrypt.compare(password, encryptedPassword);

    return resCompare;
  }
  
  /**
   * user db table 생성및 초기 데이터 삽입
   * @param userInfo 
   */
  private async createUser(userInfo: RequiredUserInfo): Promise<boolean> {
    try {

      const status: UserStatus = await this.userStatusRepository.create();

      await this.userStatusRepository.save(status);

      const profile: UserProfile = await this.userProfileRepository.create();

      profile.id = Token.getUUID();
      profile.penName = userInfo.penName;
      profile.userStatus = status;

      await this.userProfileRepository.save(profile);

      const privacy: UserPrivacy = await this.userPrivacyRepository.create();
      
      await this.userPrivacyRepository.save(privacy);

      const auth: UserAuth = await this.userAuthRepository.create();

      const salt: string = await Bcrypt.genSalt(10);
      const password: string = await Bcrypt.hash(userInfo.password, salt);

      auth.password = password;
      auth.userPrivacy = privacy;

      await this.userAuthRepository.save(auth);

      const user: User = await this.userRepository.create();

      user.id = Token.getUUID();
      user.name = userInfo.name;
      user.email = userInfo.email;
      user.userAuth = auth;
      user.userProfile = profile;
      user.userStatus = status;

      await this.userRepository.save(user);

      return true;
  
    } catch(e) {
      Logger.error(e);

      return false;
    }

  }

  /**
   * user 데이터 삭제
   * @param user 
   */
  private async deleteUser(user: User) {
    const { userProfile, userAuth, userStatus } = user;

    if(userProfile && userAuth && userStatus ) {
      const { userPrivacy } = userAuth;

      if(userPrivacy) {
        
        await this.userRepository.remove(user);
        await this.userAuthRepository.remove(userAuth);
        await this.userPrivacyRepository.remove(userPrivacy);
        await this.userProfileRepository.remove(userProfile);
        await this.userStatusRepository.remove(userStatus);

        return true;
      }
    }

    return false;
  }

  public async checkAdmin(id: string) {
    const { name }: User = await this.findOneUser({ id });
    
    return name === "admin"? true : false;
  }

  /**
   * 동일한 이메일을 사용하고 있는 지 확인
   * @param email 
   */
  public async checkUsedEmailAddress(email: string): Promise<boolean> {
    const user = await this.findOneUser({email});
    return user? true : false;
  }

  /**
   * 유저 등록 및 확인
   * @param requiredUserInfo 
   */
  public async registerUser(requiredUserInfo: RequiredUserInfo): Promise<boolean> {
    const resCreateUser = await this.createUser(requiredUserInfo);
    if(!resCreateUser) {
      return false;
    } 

    const user = await this.findOneUserAuth({email: requiredUserInfo.email});

    if(requiredUserInfo.email !== user.email) {
      return false;
    }

    const resComparePassword: boolean = await this.comparePassword(
      requiredUserInfo.password,
      user.userAuth.password
    );

    return resComparePassword;
  }

  public async authenticateUser(
    userAuthInfo: UserAuthInfo
  ): Promise<ResAuthenticatedUser> {
    const result: ResAuthenticatedUser = {
      userInfo: null,
      countOfFail: 0,
      isActive: false,
      isNotDormant: false
    }

    const user = await this.findOneUserAuth({email: userAuthInfo.email});

    if(user) {
      const comparedPassword = await Bcrypt.compare(
        userAuthInfo.password,
        user.userAuth.password
      );
    
      if(!comparedPassword) {
        user.userAuth.countOfFailures += 1;
        result.countOfFail = user.userAuth.countOfFailures;

        if(user.userAuth.countOfFailures >= 5) {
          user.userStatus.isActive = false;
          await this.userStatusRepository.save(user.userStatus);
          result.isActive = user.userStatus.isActive;
        }

      } else {
        if(user.userStatus.isActive && user.userStatus.isNotDormant) {
          const date = new Date(Date.now());

          user.userAuth.countOfFailures = 0;
          user.lastSignInDate = date;
          user.userStatus.lastAccessTime = date;

          result.isActive = true;
          result.isNotDormant = true;

          result.userInfo = {
            email: user.email,
            name: user.name,
            penName: user.userProfile.penName,
            userId: user.id,
            profileId: user.userProfile.id,
            userPhoto: user.userProfile.photo
          }

        } 
        
      }

      await this.saveUserStatus(user.userStatus);
      await this.saveUserAuth(user.userAuth);
      await this.saveUser(user);
    }

    return result;
  }

  public async updateAccessTime(userId: string): Promise<boolean> {
    const user: User = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userStatus", "user-status")
      .where({
        id: userId
      })
      .getOne();

    if(user) {
      user.userStatus.lastAccessTime = new Date(Date.now());

      await this.saveUserStatus(user.userStatus);
    }

    return user? true : false;
  }

  /**
   * token재발행을 위한 함수
   * @param userId 
   */
  public async getAuthenticatedUser(
    userId: string
  ): Promise<string | null> {
    const user: User = await this.findOneUserAuth({id: userId});

    if(user) {
      const date = new Date(Date.now());;
      user.lastSignInDate = date;
      user.userStatus.lastAccessTime = date;
      user.userAuth.countOfFailures = 0;
    
      await this.saveUserStatus(user.userStatus);
      await this.saveUserAuth(user.userAuth);
      await this.saveUser(user);
    }
    
    return user? user.id : null;
  }

  /**
   * 회원 가입
   * @param userAuthInfo 
   */
  public async withdrawalUser(userAuthInfo: UserAuthInfo & { id: string }): Promise<ResDeleteUser> {
    const result: ResDeleteUser = {
      success: false,
      error: {
        idValid: false,
        emailValid: false,
        passwordValid: false
      }
    }
    const user: User = await this.findOneUserAuth({email: userAuthInfo.email});
    if(user) {
      result.error.emailValid = true;

      if(user.id === userAuthInfo.id) {
        result.error.idValid = true;

        const comparedPassword = await Bcrypt.compare(
          userAuthInfo.password,
          user.userAuth.password
        );

        if(comparedPassword) {
          result.error.passwordValid = true;

          const { userProfile } = await this.userRepository
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.userProfile", "user-profile")
            .where({
              id: user.id
            })
            .getOne();

          const { userPrivacy } = await this.userAuthRepository
            .createQueryBuilder("userAuth")
            .leftJoinAndSelect("userAuth.userPrivacy", "user-privacy")
            .where({
              id: user.userAuth.id
            })
            .getOne();

          user.userProfile = userProfile;
          user.userAuth.userPrivacy = userPrivacy;
          
          result.success = await this.deleteUser(user);
        }
      } else {
        Logger.error("Login information does not match.");

        user.userStatus.lastAccessTime = new Date(Date.now());

        await this.saveUserStatus(user.userStatus);
      }

    }

    return result;
  }

  public async changeActivationUser(email: string, isActive: boolean) {
    const result = {
      success: false,
      error: {
        emailValid: false,
        dataBase: null
      }
    }
    const { userStatus }: User = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userStatus", "user-status")
      .where({ email })
      .getOne();

    if(userStatus) {
      result.error.emailValid = true;
      userStatus.isActive = isActive;

      try {
        await this.saveUserStatus(userStatus);

        result.success = true;
      } catch(e) {
        result.error.dataBase = e;
      }

    }

    return result;
  } 

  public async getUserInfo(id: string) {
    const user = await this.findOneUserAuth({ id });

    if(!user) {
      return {
        success: false,
        userInfo: null,
        error: "Authentication failure"
      }
    }
    
    const date = new Date(Date.now());
    user.lastSignInDate = date;
    user.userStatus.lastAccessTime = date;

    await this.saveUserStatus(user.userStatus);
    await this.saveUser(user);

    return {
      success: true,
      userInfo: {
        email: user.email,
        name: user.name,
        penName: user.userProfile.penName,
        userId: user.id,
        profileId: user.userProfile.id
      },
      error: null 
    }

  }

}
