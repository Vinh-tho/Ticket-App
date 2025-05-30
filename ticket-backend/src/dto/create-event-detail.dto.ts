import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class CreateEventDetailDto {
  @IsString()
  description: string;

  @IsUrl()
  image_detail: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;
}
