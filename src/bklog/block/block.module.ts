import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockRepository } from './repositories/block.repository';
import { TextPropertyRepository } from './repositories/text-property.repository';
import { BlockCommentRepository } from './repositories/block-comment.repository';
import { BlockPropertyRepository } from './repositories/block-property.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockRepository,
      BlockPropertyRepository,
      BlockCommentRepository,
      TextPropertyRepository
    ])
  ],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService]
})
export class BlockModule {}
