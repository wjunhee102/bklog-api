import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockRepository } from './repositories/block.repository';
import { TextPropertyRepository } from './repositories/text-property.repository';
import { BlockVersionRepository } from './repositories/block-version.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockRepository,
      TextPropertyRepository,
      BlockVersionRepository
    ])
  ],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService]
})
export class BlockModule {}
