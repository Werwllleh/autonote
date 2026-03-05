import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;
}
