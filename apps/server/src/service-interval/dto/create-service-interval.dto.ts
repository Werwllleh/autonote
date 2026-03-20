import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateServiceIntervalDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalKm?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalMonths?: number;

  @IsOptional()
  @IsDateString()
  lastServiceDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  lastServiceMileage?: number;

  @IsUUID()
  vehicleId: string;
}
