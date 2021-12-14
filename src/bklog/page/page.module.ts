import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageRepository } from './repositories/page.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { PageEditorRepository } from './repositories/page-editor.repository';
import { PageCommentRepository } from './repositories/page-comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageRepository,
      PageVersionRepository,
      PageEditorRepository,
      PageCommentRepository
    ])
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService]
})
export class PageModule {}
