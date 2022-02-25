import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/utils/common/multerOptions';
import { FileManagerService } from './filemanager.service';

@Controller('filemanager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @UseInterceptors(FilesInterceptor('images', undefined, multerOptions)) 
  @Post('upload')
  public uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const updloadedFiles: string[] = this.fileManagerService.uploadFiles(files);

    return {
      status: 200,
      message: '',
      data: {
        files: updloadedFiles
      }
    }
  }
}
