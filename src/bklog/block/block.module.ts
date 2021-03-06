import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockRepository } from './repositories/block.repository';
import { BlockCommentRepository } from './repositories/block-comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockRepository,
      BlockCommentRepository
    ])
  ],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService]
})
export class BlockModule {}
