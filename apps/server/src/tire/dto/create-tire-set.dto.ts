import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTireSetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['summer', 'winter_stud', 'winter_friction', 'all_season'])
  season: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsInt()
  @Min(1990)
  productionYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  treadDepth?: number;

  @IsOptional()
  @IsBoolean()
  isMounted?: boolean;

  @IsOptional()
  @IsString()
  storageLocation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  installedMileage?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalMileage?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;
}
