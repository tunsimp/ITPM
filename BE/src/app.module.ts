import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MoneyModule } from './money/money.module';
import { TasksModule } from './tasks/tasks.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, MoneyModule, TasksModule, ScheduleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
