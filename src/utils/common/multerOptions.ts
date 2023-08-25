import { Express } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { Token } from './token.util';
import { ProcessEnvUtil } from './env.util';
import { extname } from 'path';

function getFileName(file: Express.Multer.File) {
  return `${Token.getUUID()}-${extname(file.originalname)}`;
}

export const multerOptions = {
  fileFilter: (request: any, file: Express.Multer.File, callback: (prop: any, prop2: any) => void) => {
    if(file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },

  storage: diskStorage({
    destination: (request: any, file: any, callback: (prop: any, prop2: any) => void) => {
      const uploadPath = 'public';

      if(!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }

      callback(null, uploadPath);
    },

    filename: (request, file, callback) => {
      callback(null, getFileName(file));
    }
  })
}

export const createImageURL = (file: Express.Multer.File): string | null => {
  const serverAddress: string | null = ProcessEnvUtil.getProcessEnv("SERVER_ADDRESS");

  return serverAddress? `${serverAddress}/public/${file.filename}` : null;
}