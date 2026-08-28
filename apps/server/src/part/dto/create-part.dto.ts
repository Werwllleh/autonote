import { IsString, IsNumber, IsOptional, IsInt, IsUUID, Min } from 'class-validator';

export class CreatePartDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  article?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  vehicleId: string;
}
