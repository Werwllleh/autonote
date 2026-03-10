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
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockPartDto {
  @IsUUID()
  partId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class PartDto {
  @IsOptional()
  @IsString()
  article?: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts?: PartDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockPartDto)
  stockParts?: StockPartDto[];
}
