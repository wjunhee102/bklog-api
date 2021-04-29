import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { UserStatusRepository } from './repositories/user-status.repository';
import { UserFollowRepository } from './repositories/user-follow.repository';
import { UserBlockingRepository } from './repositories/user-blocking.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProfileRepository,
      UserStatusRepository,
      UserFollowRepository,
      UserBlockingRepository
    ]),
    AuthModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
