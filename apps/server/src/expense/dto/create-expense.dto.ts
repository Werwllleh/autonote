import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @IsUUID()
  vehicleId: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  liters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerLiter?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonuses?: number;
}
