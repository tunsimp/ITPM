import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMoneyDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsOptional()
  @IsString()
  readonly description?: string;
}
