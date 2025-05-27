import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
} 