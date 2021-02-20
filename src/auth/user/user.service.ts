import { Injectable, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './user.repository';
import * as Bcrypt from 'bcryptjs';
import { Token } from 'src/util/token.util';
import { User } from 'src/entities/user/user.entity';
import { UserInfo, Register, LoginUserInfo, Login } from '../../types/user';
import { ValidInfo, UsedEmail, ClientData } from './user.type';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository, 
    private jwtService: JwtService
  ){}

  private regEmail = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i);
  private regPassword = new RegExp(/^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/);

  public async registerUser(register: Register): Promise<UserInfo | ValidInfo | UsedEmail> {
    
    const checkingEmail = this.regEmail.test(register.email);
    const checkingPassword = this.regPassword.test(register.password);

    if(!checkingEmail || !checkingPassword) {
      return {
        emailValid: checkingEmail,
        passwodValid: checkingPassword
      }
    }
    
    const registeredUser: User | undefined  = await this.userRepository.findOne({
      email: register.email
    });

    if(registeredUser) {
      return {
        emailUsed: true
      }
    }

    const registerUser = await this.userRepository.create();

    // Encode User Password
    const salt: string = await Bcrypt.genSalt(10);
    const password: string = await Bcrypt.hash(register.password, salt);
    
    registerUser.email = register.email;
    registerUser.name = register.name;
    registerUser.uuid = Token.getUUID();
    registerUser.password = password;
    
    const user = await this.userRepository.save(registerUser);
    const userInfo: UserInfo = {
      email: user.email,
      name: user.name,
      uuid: user.uuid,
    };
    return userInfo;
  }

  public async login(loginUser: ClientData): Promise<LoginUserInfo>{
    const user: User = await this.userRepository.findOne({
      where:{
        email: loginUser.email
      }
    });

    if(!user) {
      return null;
    }

    const passwordCheck = await Bcrypt.compare(loginUser.password, user.password);

    if(!passwordCheck){
      return null;
    }

    const payload = { name: user.name, email: user.email, agent: loginUser.agent }

    const access_token = this.jwtService.sign(payload);
    const decoding = this.jwtService.decode(access_token);
    console.log("jwt: ", decoding);
    
    user.lastLoginDate = new Date();
    
    await this.userRepository.save(user);;

    const userInfo: LoginUserInfo = {
      email: user.email,
      name: user.name,
      uuid: user.uuid,
      lastLogin: user.lastLoginDate,
      jwt: access_token
    };
    return userInfo;
  }

  public async checkEmailAddress(email: string) {

    const checkingEmail = this.regEmail.test(email);
    
    if(!checkingEmail) {
      return {
        valid: false
      }
    }

    const user: User = await this.userRepository.findOne({
      where: {
        email: email,
        isAcrive: true
      }
    });

    return {
      valid: checkingEmail,
      used: user? true : false
    }

  }

}

