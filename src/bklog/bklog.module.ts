import { Module } from '@nestjs/common';
import { PageModule } from './page/page.module';
import { BlockModule } from './block/block.module';

@Module({
  imports: [
    PageModule,
    BlockModule
  ]
})
export class BklogModule {}
