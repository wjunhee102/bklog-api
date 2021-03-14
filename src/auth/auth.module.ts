import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants, jwtSignOptions } from 'secret/constants';
import { PrivateUserModule } from './private-user/private-user.module';

@Module({
  imports: [
    PrivateUserModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: jwtSignOptions
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {};
