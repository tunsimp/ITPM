import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { jwtConfig } from './config/jwt.config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [UserModule, JwtModule.register(jwtConfig)],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule { }
