import { Module } from '@nestjs/common';
import { PageModule } from './page/page.module';
import { BlockModule } from './block/block.module';
import { BklogController } from './bklog.controller';
import { BklogService } from './bklog.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageVersionRepository } from './repositories/page-version.repository';
import { BlockCommentRepository } from './block/repositories/block-comment.repository';
import { PageCommentRepository } from './page/repositories/page-comment.repository';
import { PageStarRepository } from './page/repositories/page-star.repository';
import { TestRepository } from './block/repositories/test.repositoty';
import { Test2Respository } from './block/repositories/test2.repository';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([
      PageVersionRepository,
      PageStarRepository,
      PageCommentRepository,
      BlockCommentRepository,
      TestRepository,
      Test2Respository
    ]),
    PageModule,
    BlockModule,
  ],
  controllers: [BklogController],
  providers: [BklogService]
})
export class BklogModule {}
