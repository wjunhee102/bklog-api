import { Module } from '@nestjs/common';
import { FileManagerService } from './filemanager.service';
import { FileManagerController } from './filemanager.controller';

@Module({
  providers: [FileManagerService],
  controllers: [FileManagerController]
})
export class FileManagerModule {}
