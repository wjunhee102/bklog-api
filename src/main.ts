import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { cookieConstants } from 'secret/constants';

async function bootstrap() {
  //undefined는 insomnia 때문
  const whitelist = ['https://wjunhee102.github.io', 'http://localhost', 'http://localhost:3000', 'http://localhost:4500', undefined];
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (whitelist.indexOf(origin) !== -1) {
        console.log("allowed cors for:", origin);
        callback(null, true);
      } else {
        console.log("blocked cors for:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
    credentials: true,
  });
  app.use(cookieParser(cookieConstants));
  app.setGlobalPrefix('/v2');

  await app.listen(4500);
}
bootstrap();
