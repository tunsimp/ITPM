import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteMoneyDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsOptional()
  @IsString()
  readonly reason?: string;
}
