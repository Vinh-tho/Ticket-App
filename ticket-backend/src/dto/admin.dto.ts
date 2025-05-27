import { IsEmail, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsIn(['user', 'admin'])
  role: string;
}

export class LoginAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsIn(['user', 'admin'])
  @IsOptional()
  role?: string;
} 