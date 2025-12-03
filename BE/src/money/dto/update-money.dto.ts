import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { MoneyType } from '../entities/money.entity';

export class UpdateMoneyDto {
	@IsOptional()
	@IsString()
	readonly name?: string;

	@IsOptional()
	@IsNumber()
	readonly amount?: number;

	@IsOptional()
	@IsEnum(MoneyType)
	readonly type?: MoneyType;

	@IsOptional()
	@IsString()
	readonly description?: string;
}
