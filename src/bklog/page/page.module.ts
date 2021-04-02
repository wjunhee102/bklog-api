import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageRepository } from './repositories/page.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PageRepository
    ])
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService]
})
export class PageModule {}
