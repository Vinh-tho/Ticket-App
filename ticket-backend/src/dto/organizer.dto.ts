import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateOrganizerDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  legal_representative: string;

  @IsString()
  address: string;

  @IsString()
  hotline: string;

  @IsEmail()
  email: string;

  @IsString()
  business_license: string;
}

export class UpdateOrganizerDto extends CreateOrganizerDto {} 