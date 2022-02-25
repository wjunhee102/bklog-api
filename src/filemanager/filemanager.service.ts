import { Injectable } from '@nestjs/common';
import { createImageURL } from 'src/utils/common/multerOptions';
import { Express } from 'express';

@Injectable()
export class FileManagerService {

  public uploadFiles(files: Express.Multer.File[]): string[] {
    const generatedFiles: string[] = [];

    for(const file of files) {
      const imageUrl = createImageURL(file);

      if(imageUrl) generatedFiles.push(imageUrl);
    }

    return generatedFiles;
  }
}
