import { Module } from '@nestjs/common';
import { PageModule } from './page/page.module';
import { BlockModule } from './block/block.module';
import { BklogController } from './bklog.controller';
import { BklogService } from './bklog.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PageModule,
    BlockModule,
    AuthModule,
    UserModule
  ],
  controllers: [BklogController],
  providers: [BklogService]
})
export class BklogModule {}
