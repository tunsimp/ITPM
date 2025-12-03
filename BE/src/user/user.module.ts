import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { jwtConfig } from 'src/auth/config/jwt.config';

@Module({
  imports: [JwtModule.register(jwtConfig)],
  providers: [UsersService, JwtAuthGuard],
  controllers: [UserController],
  exports: [UsersService],
})
export class UserModule { }
