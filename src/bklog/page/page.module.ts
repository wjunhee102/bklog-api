import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageRepository } from './repositories/page.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { PageComment } from 'src/entities/bklog/page-comment.entity';
import { PageEditableListRepository } from './repositories/page-editable-list.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageRepository,
      PageVersionRepository,
      PageEditableListRepository,
      PageComment
    ])
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService]
})
export class PageModule {}
