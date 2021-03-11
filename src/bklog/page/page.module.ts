import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageRepository } from './repositories/page.repository';
import { UserModule } from 'src/user/user.module';
import { PageCommentRepository } from './repositories/page-comment.repository';
import { PageStarRepository } from './repositories/page-star.repository';
import { CommentToCommentRepository } from './repositories/comment-comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageRepository,
      PageStarRepository,
      PageCommentRepository,
      CommentToCommentRepository
    ]),
    UserModule
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService]
})
export class PageModule {}
