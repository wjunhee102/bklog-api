import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { cookieConstants } from 'secret/constants';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setWhitelist } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const whitelist = setWhitelist(process.env.ENV);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  .use(cookieParser(cookieConstants))
  .setGlobalPrefix('/v2')
  .enableCors({
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        Logger.error("blocked cors for:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
    credentials: true,
  });

  await app.listen(4500);
}
bootstrap();