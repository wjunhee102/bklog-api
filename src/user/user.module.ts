import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants, jwtSignOptions } from 'secret/constants';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollowerRepository } from './repositories/user-follower.repository';
import { UserFollowingRepository } from './repositories/user-following.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserStatusRepository,
      UserFollowerRepository,
      UserFollowingRepository
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
