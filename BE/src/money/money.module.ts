import { Module } from '@nestjs/common';
import { MoneyService } from './money.service';
import { MoneyController } from './money.controller';

@Module({
  controllers: [MoneyController],
  providers: [MoneyService],
  exports: [MoneyService],
})
export class MoneyModule {}
