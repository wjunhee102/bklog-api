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
import { CommentToCommentRepository } from './page/repositories/comment-comment.repository';
import { PageStarRepository } from './page/repositories/page-star.repository';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([
      PageVersionRepository,
      PageStarRepository,
      PageCommentRepository,
      CommentToCommentRepository,
      BlockCommentRepository
    ]),
    PageModule,
    BlockModule,
  ],
  controllers: [BklogController],
  providers: [BklogService]
})
export class BklogModule {}
