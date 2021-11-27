import { Module } from '@nestjs/common';
import { PrivateUserService } from './private-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPrivacyRepository } from './repositories/user-privacy.repository';
import { UserAuthRepository } from './repositories/user-auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserProfileRepository } from 'src/user/repositories/user-profile.repository';
import { UserStatusRepository } from 'src/user/repositories/user-status.repository';
import { PageModule } from 'src/bklog/page/page.module';
import { BlockModule } from 'src/bklog/block/block.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPrivacyRepository,
      UserAuthRepository,
      UserRepository,
      UserProfileRepository,
      UserStatusRepository
    ]),
    PageModule,
    BlockModule
  ],
  providers: [PrivateUserService],
  exports: [PrivateUserService]
})
export class PrivateUserModule {}
