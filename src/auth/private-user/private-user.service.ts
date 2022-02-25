import { Injectable, Logger } from '@nestjs/common';
import { UserPrivacyRepository } from './repositories/user-privacy.repository';
import * as Bcrypt from 'bcryptjs';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserProfileRepository } from 'src/user/repositories/user-profile.repository';
import { UserStatusRepository } from 'src/user/repositories/user-status.repository';
import { UserAuthInfo, RequiredUserInfo, ResAuthenticatedUser, InfoToFindUser, UserIdList, UserIdNPenName } from './types/private-user.type';
import { UserStatus } from 'src/entities/user/user-status.entity';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserPrivacy } from './entities/user-privacy.entity';
import { Token } from 'src/utils/common/token.util';
import { ResSignInUser } from '../auth.type';
import { InfoToFindUserProfile } from 'src/user/user.type';
import { Connection } from 'typeorm';
import { UserFollow } from 'src/entities/user/user-follow.entity';
import { PageService } from 'src/bklog/page/page.service';
import { BlockService } from 'src/bklog/block/block.service';
import { Block } from 'src/entities/bklog/block.entity';
import { BlockData } from 'src/bklog/block/block.type';
import { AuthErrorMessage, ComposedResponseErrorType, SystemErrorMessage } from 'src/utils/common/response.util';

@Injectable()
export class PrivateUserService {
  constructor(
    private connection: Connection,
    private readonly userPrivacyRepository: UserPrivacyRepository,
    private readonly userRepository: UserRepository,
    private readonly userAuthRepository: UserAuthRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly pageService: PageService,
    private readonly blockService: BlockService
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
  private findOneUserProfileUserId(userId: string) {
    return this.userRepository.findOne({
      relations: ["userProfile"],
      where: {
        id: userId
      },
      select: ["id", "userProfile"]
    });
  }

  private findOneUserNProfileId(userId: string) {
    return this.userRepository.findOne({
      relations: ["userProfile"],
      where: {
        id: userId
      }
    })
  }

  /**
   * 
   * @param userId 
   */
  private async findOneUserAuth(userInfo: InfoToFindUser) {
    return await this.userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.userAuth", "user-auth")
    .leftJoinAndSelect("user.userProfile", "user-profile")
    .leftJoinAndSelect("user.userStatus", "user-status")
    .where(userInfo)
    .getOne();
  }

   /**
   * profile 찾기
   * @param penName 
   */
  private async findOneUserProfile(infoToFindUserProfile : InfoToFindUserProfile) {
    const userProfile = await this.userProfileRepository.findOne({
      where: infoToFindUserProfile
    });

    return userProfile;
  }
 

  private async saveUser(user: User): Promise<boolean> {
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
    const status: UserStatus = this.userStatusRepository.create();
    
    status.id = Token.getUUID();

    const profile: UserProfile = this.userProfileRepository.create();

    profile.id = Token.getUUID();
    profile.penName = userInfo.penName;
    profile.userStatus = status;
    profile.bio = userInfo.bio;

    const privacy: UserPrivacy = this.userPrivacyRepository.create();

    privacy.id = Token.getUUID();

    const auth: UserAuth = this.userAuthRepository.create();

    const salt: string = await Bcrypt.genSalt(10);
    const password: string = await Bcrypt.hash(userInfo.password, salt);

    auth.id = Token.getUUID();
    auth.password = password;
    auth.userPrivacy = privacy;

    const user: User = this.userRepository.create();

    user.id = Token.getUUID();
    user.firstName = userInfo.firstName;
    user.lastName = userInfo.lastName;
    user.email = userInfo.email;
    user.userAuth = auth;
    user.userProfile = profile;
    user.userStatus = status;

    const blockData1: BlockData = {
      id: Token.getUUID(),
      position: "1",
      type: "text",
      styleType: "bk-h1",
      contents: [["환영합니다."]],
      styles: {
        color: null,
        backgroundColor: null
      }
    }

    const blockData2: BlockData = {
      id: Token.getUUID(),
      position: "2",
      type: "text",
      styleType: "bk-h1",
      contents: [["글을 작성해보세요."]],
      styles: {
        color: null,
        backgroundColor: null
      }
    }

    const pageElements = this.pageService.preCreateBklog({
        title: "hello world",
        disclosureScope: 5,
        userProfile: profile,
        userId: user.id,
        profileId: profile.id
      },
      {
        blockData: {
          create: [
            {
              id: blockData1.id,
              type: blockData1.type,
              payload: blockData1
            },
            {
              id: blockData2.id,
              type: blockData2.type,
              payload: blockData2
            }
          ]
        }
      }
    );

    const block1 = this.blockService.createBlock({
      ...blockData1,
      page: pageElements[0]
    });

    const block2 = this.blockService.createBlock({
      ...blockData2,
      page: pageElements[0]
    });

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save([
        status, 
        profile, 
        privacy, 
        auth, 
        user, 
        ...pageElements,
        block1, 
        block2,
      ]);
      
      await queryRunner.commitTransaction();
      
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return false;
    } finally {
      await queryRunner.release();
    }

    return true;
  }

  /**
   * 수정해야함..
   * user 데이터 삭제
   * @param user 
   */
  private async deleteUser(user: User): Promise<ComposedResponseErrorType | null> {
    const { userProfile, userAuth, userStatus } = user;
    const { userPrivacy } = userAuth;
  
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.pageService.removeAllPage(queryRunner, userProfile);

      const userFollowList = await queryRunner.manager.find(UserFollow, {
        where: [
          {userProfile},
          {relativeProfile: userProfile}
        ],
        select: ["id"]
      });

      if(userFollowList[0]) await queryRunner.manager.delete(UserFollow, userFollowList.map(user => user.id));

      await queryRunner.manager.remove(User, user);
      await queryRunner.manager.remove(UserProfile, userProfile);
      await queryRunner.manager.remove(UserStatus, userStatus);
      await queryRunner.manager.remove(UserAuth, userAuth);
      await queryRunner.manager.remove(UserPrivacy, userPrivacy);

      await queryRunner.commitTransaction();

      return null;
    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      return SystemErrorMessage.db;
    } finally {
      console.log("success");
      await queryRunner.release();
    }
  }

  /**
   * 
   * @param id 
   */
  public async checkAdmin(id: string) {
    const user = await this.findOneUser({ id });

    if(!user) return false;
    
    return user.firstName === "admin"? true : false;
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
    
    if(!resCreateUser) return false;

    const user = await this.findOneUserAuth({email: requiredUserInfo.email});

    if(!user || requiredUserInfo.email !== user.email) return false;

    const resComparePassword = await this.comparePassword(
      requiredUserInfo.password,
      user.userAuth.password
    );

    return resComparePassword;
  }

  /**
   * 
   * @param userAuthInfo 
   */
  public async authenticateUser(
    userAuthInfo: UserAuthInfo
  ): Promise<ResAuthenticatedUser> {
    const result: ResAuthenticatedUser = {
      userInfo: null,
      countOfFail: -1,
      isActive: false,
      isNotDormant: false
    }

    const user = await this.findOneUserAuth({email: userAuthInfo.email});

    if(!user) return result;

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
        result.countOfFail = 0;

        result.userInfo = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          penName: user.userProfile.penName,
          userId: user.id,
          profileId: user.userProfile.id,
          photo: user.userProfile.photo,
          bio: user.userProfile.bio
        }
      } 
      
    }

    await this.saveUserStatus(user.userStatus);
    await this.saveUserAuth(user.userAuth);
    await this.saveUser(user);

    return result;
  }

  public async updateAccessTime(userId: string): Promise<boolean> {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userStatus", "user-status")
      .where({
        id: userId
      })
      .getOne();

    if(!user) return false;

    user.userStatus.lastAccessTime = new Date(Date.now());

    await this.saveUserStatus(user.userStatus);

    return true;
  }

  /**
   * token재발행을 위한 함수
   * @param userId 
   */
  public async getAuthenticatedUser(
    userId: string
  ): Promise<string | null> {
    let user = await this.findOneUserAuth({id: userId});

    if(!user) return null;

    const date = new Date(Date.now());;
    user.lastSignInDate = date;
    user.userStatus.lastAccessTime = date;
    user.userAuth.countOfFailures = 0;

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user.userStatus);
      await queryRunner.manager.save(user.userAuth);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

    } catch(e) {
      Logger.error(e);
      await queryRunner.rollbackTransaction();

      user = undefined;

    } finally {
      await queryRunner.release();
    }
    
    return user? user.id : null;
  }

  /**
   * 회원 탈퇴
   * @param userAuthInfo 
   */
  public async withdrawalUser({id, email, password}: UserAuthInfo & { id: string }): Promise<ComposedResponseErrorType | null> {

    const user = await this.findOneUserAuth({ id , email });

    if(!user) return AuthErrorMessage.failureSignIn();

    const comparedPassword = await Bcrypt.compare(
      password,
      user.userAuth.password
    );

    if(comparedPassword) {
      return AuthErrorMessage.failureSignIn();
    }

    const userProfile = await this.userProfileRepository
      .findOne({
        where: {
          id: user.userProfile.id
        }
      });

    if(!userProfile) return AuthErrorMessage.notFound("userProfile");

    const userAuth = await this.userAuthRepository
      .createQueryBuilder("userAuth")
      .leftJoinAndSelect("userAuth.userPrivacy", "user-privacy")
      .where({
        id: user.userAuth.id
      })
      .getOne();

    if(!userAuth) return AuthErrorMessage.notFound("userAuth");

    const { userPrivacy } = userAuth;

    if(!userPrivacy) return AuthErrorMessage.notFound("userProfile, userPrivacy");

    user.userProfile = userProfile;
    user.userAuth.userPrivacy = userPrivacy;
    
    const resultDelete = await this.deleteUser(user);
    
    if(resultDelete) {
      user.userStatus.lastAccessTime = new Date(Date.now());

      await this.saveUserStatus(user.userStatus);

      return resultDelete;
    }
    
    return null;
  }

  public async testDeleteUser(email: string): Promise<ComposedResponseErrorType | null> {
    const user = await this.findOneUserAuth({ email });

    if(!user) return AuthErrorMessage.notFound("user");

    const userAuth = await this.userAuthRepository.findOne({
      where: {
        id: user.userAuth.id
      },
      relations: ["userPrivacy"]
    });

    if(!userAuth) return AuthErrorMessage.notFound("userAuth");

    const { userPrivacy } = userAuth;

    user.userAuth.userPrivacy = userPrivacy;

    return await this.deleteUser(user);
  }

  public async changeActivationUser(email: string, isActive: boolean) {
    const result: {
      success: boolean;
      error: {
        emailValid: boolean;
        dataBase: string | null;
      }
    } = {
      success: false,
      error: {
        emailValid: false,
        dataBase: null
      }
    }


    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.userStatus", "user-status")
      .where({ email })
      .getOne();

    if(!user) return result;

    const { userStatus } = user;

    if(userStatus) {
      result.error.emailValid = true;
      userStatus.isActive = isActive;

      try {
        await this.saveUserStatus(userStatus);

        result.success = true;
      } catch(e) {
        result.error.dataBase = e as string;
      }

    }

    return result;
  } 

  public async getUserInfo(id: string): Promise<ResSignInUser> {
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
        firstName: user.firstName,
        lastName: user.lastName,
        penName: user.userProfile.penName,
        id: user.userProfile.id,
        photo: user.userProfile.photo,
        bio: user.userProfile.bio
      },
      error: null 
    }

  }
  
  public async getUserIdNProfileId(userId: string): Promise<UserIdList | null> {
    const user = await this.findOneUserProfileUserId(userId);

    return user? {
      userId: user.id,
      profileId: user.userProfile.id
    } : null;
  }

  public async getUserIdNPenName(userId: string): Promise<UserIdNPenName | null> {
    const user = await this.findOneUserProfileUserId(userId);

    return user? {
      userId: user.id,
      penName: user.userProfile.penName
    } : null;
  }

}
