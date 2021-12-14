import { Injectable, Logger } from '@nestjs/common';
import { UserPrivacyRepository } from './repositories/user-privacy.repository';
import * as Bcrypt from 'bcryptjs';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserProfileRepository } from 'src/user/repositories/user-profile.repository';
import { UserStatusRepository } from 'src/user/repositories/user-status.repository';
import { UserAuthInfo, RequiredUserInfo, ResAuthenticatedUser, InfoToFindUser, ResDeleteUser, UserIdList, UserIdNPenName } from './types/private-user.type';
import { UserStatus } from 'src/entities/user/user-status.entity';
import { UserProfile } from 'src/entities/user/user-profile.entity';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserPrivacy } from './entities/user-privacy.entity';
import { Token } from 'src/utils/common/token.util';
import { ResSignInUser } from '../auth.type';
import { InfoToFindUserProfile } from 'src/user/user.type';
import { Connection, QueryRunner } from 'typeorm';
import { UserFollow } from 'src/entities/user/user-follow.entity';
import { PageService } from 'src/bklog/page/page.service';
import { BlockService } from 'src/bklog/block/block.service';
import { Page } from 'src/entities/bklog/page.entity';
import { Block } from 'src/entities/bklog/block.entity';
import { PageVersion } from 'src/entities/bklog/page-version.entity';
import { BlockData } from 'src/bklog/block/block.type';
import { throws } from 'assert';
import { PageEditor } from 'src/entities/bklog/page-editor.entity';

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
  private findOneUserProfileUserId(userId: string): Promise<User> {
    return this.userRepository.findOne({
      relations: ["userProfile"],
      where: {
        id: userId
      },
      select: ["id", "userProfile"]
    });
  }

  private findOneUserNProfileId(userId: string): Promise<User> {
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
  private async findOneUserAuth(userInfo: InfoToFindUser): Promise<User> {
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
  private async findOneUserProfile(infoToFindUserProfile : InfoToFindUserProfile): Promise<UserProfile | null> {
    const userProfile: UserProfile | null = await this.userProfileRepository.findOne({
      where: infoToFindUserProfile
    });

    return userProfile;
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

    const page: Page = this.pageService.createPage({
      title: "hello world",
      disclosureScope: 5,
      userProfile: profile,
      userId: user.id,
      profileId: profile.id
    });

    const pageEditor: PageEditor = this.pageService.createPageEditor(page, profile);

    const block1: Block = this.blockService.createBlock({
      id: Token.getUUID(),
      position: "1",
      styleType: "bk-h1",
      contents: [["환영합니다."]],
      styles: {
        color: null,
        backgroundColor: null
      },
      page
    });

    const block2: Block = this.blockService.createBlock({
      id: Token.getUUID(),
      position: "2",
      styleType: "bk-h1",
      contents: [["글을 작성해보세요."]],
      styles: {
        color: null,
        backgroundColor: null
      },
      page
    });

    const blockData1: BlockData = Object.assign({}, block1, {
      blockComment: undefined, 
      page: undefined
    });

    const blockData2: BlockData = Object.assign({}, block2, {
      blockComment: undefined, 
      page: undefined
    });

    const pageVersion: PageVersion = this.pageService.createPageVersion(page, {
      modifyBlockData: {
        create: [
          {
            blockId: block1.id,
            set: "block",
            payload: blockData1
          },
          {
            blockId: block2.id,
            set: "block",
            payload: blockData2
          }
        ]
      }
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
        page, 
        block1, 
        block2,
        pageVersion,
        pageEditor
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
  private async deleteUser(user: User) {
    const { userProfile, userAuth, userStatus } = user;

    if(userProfile && userAuth && userStatus ) {
      const { userPrivacy } = userAuth;

      if(userPrivacy) {

        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

          await queryRunner.manager.remove(User, user);
          await queryRunner.manager.createQueryBuilder()
            .delete()
            .from(UserFollow)
            .where("userfollow.userProfileId :userProfileid", {userProfileId: userProfile.id})
            .execute();
            
          await queryRunner.manager.delete(UserFollow, {
            userProfile: userProfile
          });
          await queryRunner.manager.delete(UserFollow, {
            userProfile: userProfile
          });
          await queryRunner.manager.remove(UserProfile, userProfile);

        } catch(e) {
          Logger.error(e);
          await queryRunner.rollbackTransaction();

        } finally {
          await queryRunner.release();
        }

        
        // await this.userRepository.remove(user);
        // await this.userAuthRepository.remove(userAuth);
        // await this.userPrivacyRepository.remove(userPrivacy);
        // await this.userProfileRepository.remove(userProfile);
        // await this.userStatusRepository.remove(userStatus);

        return true;
      }
    }

    return false;
  }

  /**
   * 
   * @param id 
   */
  public async checkAdmin(id: string) {
    const { firstName }: User = await this.findOneUser({ id });
    
    return firstName === "admin"? true : false;
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
      countOfFail: -1,
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
    let user: User = await this.findOneUserAuth({id: userId});

    if(user) {
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

        user = null;

      } finally {
        await queryRunner.release();
      }
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

          const userProfile: UserProfile = await this.userProfileRepository
            .findOne({
              relations: ["follows", "followers"],
              where: {
                id: user.userProfile.id
              }
            });

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
  
  public async getUserIdNProfileId(userId: string): Promise<UserIdList> {
    const user: User = await this.findOneUserProfileUserId(userId);

    return user? {
      userId: user.id,
      profileId: user.userProfile.id
    } : null;
  }

  public async getUserIdNPenName(userId: string): Promise<UserIdNPenName> {
    const user: User = await this.findOneUserProfileUserId(userId);

    return user? {
      userId: user.id,
      penName: user.userProfile.penName
    } : null;
  }

}
