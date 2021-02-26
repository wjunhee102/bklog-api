import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import * as Bcrypt from 'bcryptjs';
import { Token } from 'src/util/token.util';
import { User } from 'src/entities/user/user.entity';
import { RegiInfoUser, ResIdentifyUser, UserAuthInfo } from './user.type';
import { ResRegisterUser } from 'src/auth/auth.type';
import { UserInfo } from 'src/user/user.type';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository
  ){}

  private regEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i);
  private regPassword = new RegExp(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/);

  /**
   * return User
   * @param email 
   */
  private async findOneUser(email: string): Promise<User | null> {
    const user: User = await this.userRepository.findOne({
      where: {
        email
      }
    });

    return user;
  }

  /**
   * 
   * @param uuid 
   */
  private async findOneUserUUID(uuid: string): Promise<User | null> {
    const user: User = await this.userRepository.findOne({
      where: {
        uuid
      }
    });

    return user;
  }
  
  /**
   * 
   * @param userInfo 
   */
  private async identifyUser2( 
    userInfo: UserAuthInfo
  ): Promise<User | null> {
    const user: User = await this.findOneUser(userInfo.email);

    if(!user) {
      return null;
    }

    const passwordCheck = await Bcrypt.compare(userInfo.password, user.password);

    if(!passwordCheck) {
      user.countOfFailures += 1;
      
      if(user.countOfFailures >= 5) {
        user.isActive = false
      }
    } else {
      user.countOfFailures = 0;
      user.lastSignInDate = new Date();
    }

    await this.userRepository.save(user);

    return  user;
  }

  /**
   * return boolean
   * @param user 
   * @param isActive 
   */
  private async changeUserActiveState(user: User, isActive: boolean) {
    user.isActive = isActive;

    await this.userRepository.save(user);
  }

  private async deleteUser(user) {
    return await this.userRepository.delete(user);
  }

  public async registerUser(regiInfoUser: RegiInfoUser): Promise<ResRegisterUser> {
    
    const checkingEmail = this.regEmail.test(regiInfoUser.email);
    const checkingPassword = this.regPassword.test(regiInfoUser.password);

    if(!checkingEmail || !checkingPassword) {
      return {
        success: false,
        error: {
          emailValid: checkingEmail,
          passwordValid: checkingPassword,
          emailUsed: false
        }
      }
    }
    
    const registeredUser: User | undefined  = await this.findOneUser(regiInfoUser.email);

    if(registeredUser) {
      return {
        success: false,
        error: {
          emailValid: true,
          passwordValid: true,
          emailUsed: true
        }
      }
    }

    const registerUser = await this.userRepository.create();

    // Encode User Password
    const salt: string = await Bcrypt.genSalt(10);
    const password: string = await Bcrypt.hash(regiInfoUser.password, salt);
    
    registerUser.email = regiInfoUser.email;
    registerUser.name = regiInfoUser.name;
    registerUser.uuid = Token.getUUID();
    registerUser.password = password;
    
    await this.userRepository.save(registerUser);

    return {
      success: true,
      error: null
    };
  }

  public async getSignInUser(
    uuid: string
  ): Promise<UserInfo | null> {
    const user: User = await this.findOneUserUUID(uuid);

    if(!user) {
      return null;
    }
    user.lastSignInDate = new Date();

    await this.userRepository.save(user);

    return {
      name: user.name,
      email: user.email,
      uuid: user.uuid
    }

  } 

  public async identifyUser(
    userInfo: UserAuthInfo
  ): Promise<ResIdentifyUser> {

    const result:ResIdentifyUser = {
      userInfo: null,
      count: 0,
      isActive: false,
      isNotDormant: false
    };

    const user: User = await this.findOneUser(userInfo.email);

    if(!user) {
      return result;
    }

    const passwordCheck = await Bcrypt.compare(userInfo.password, user.password);

    if(!passwordCheck) {
      user.countOfFailures += 1;
      
      if(user.countOfFailures >= 5) {
        user.isActive = false
      }

      await this.userRepository.save(user);

      return Object.assign({}, result, {
        count: user.countOfFailures,
        isActive: user.isActive
      });
    }

    if(!user.isActive || !user.isNotDormant) {
      user.isNotDormant = true;

      this.userRepository.save(user);
      return Object.assign({}, result, {
        count: user.countOfFailures,
        isActive: user.isActive,
        isNotDormant: user.isNotDormant
      });
    }

    user.countOfFailures = 0;
    user.lastSignInDate = new Date();

    console.log(user);

    await this.userRepository.save(user);

    return {
      userInfo: {
        name: user.name,
        email: user.email,
        uuid: user.uuid
      },
      count: user.countOfFailures,
      isActive: user.isActive,
      isNotDormant: user.isNotDormant
    }
  }

  public async deleteInactiveUser(uuid: string) {
    const user: User = await this.findOneUserUUID(uuid);

    if(!user) {
      return {
        success: false,
        error: {
          userInfo: false,
          isActive: false
        }
      }
    }

    if(user.isActive) {
      return {
        success: false,
        error: {
          userInfo: true,
          isActive: true
        }
      }
    }

    await this.deleteUser(user);

    return {
      success: true,
      error: null
    }
  }

  public async checkEmailAddress(email: string) {

    const checkingEmail = this.regEmail.test(email);
    
    if(!checkingEmail) {
      return {
        valid: false
      }
    }

    const user: User = await this.findOneUser(email);

    return {
      valid: checkingEmail,
      used: user? true : false
    }

  }

}

