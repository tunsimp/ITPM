import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMoneyDto {
	@IsOptional()
	@IsString()
	readonly name?: string;

	@IsOptional()
	@IsNumber()
	readonly amount?: number;

	@IsOptional()
	@IsString()
	readonly description?: string;
}
