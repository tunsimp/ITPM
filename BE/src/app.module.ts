import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule],
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MoneyModule } from './money/money.module';

@Module({
  imports: [AuthModule, UserModule, MoneyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
