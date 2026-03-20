import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  IsUUID,
  IsArray,
  ValidateNested,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartDto } from './create-expense.dto';

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

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  liters?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  pricePerLiter?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  bonuses?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts?: PartDto[] | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsNumber()
  @Min(0)
  laborCost?: number | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  dateFrom?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  dateTo?: string | null;
}
