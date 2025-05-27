import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateGiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 