import {
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class MountTireSetDto {
  @IsInt()
  @Min(0)
  mileage: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  treadDepth?: number;

  @IsOptional()
  @IsBoolean()
  createExpense?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  expenseAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
