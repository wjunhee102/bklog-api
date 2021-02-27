import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants, jwtSignOptions } from 'secret/constants';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserStatusRepository } from './repositories/user-status.repository';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserStatusRepository
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: jwtSignOptions
    })
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
