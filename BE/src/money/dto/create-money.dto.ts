import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { MoneyType } from '../entities/money.entity';

export class CreateMoneyDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  @IsEnum(MoneyType)
  readonly type: MoneyType;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
