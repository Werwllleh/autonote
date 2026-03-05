import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
