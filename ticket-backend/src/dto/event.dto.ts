import {
  IsString,
  IsOptional,
  IsUrl,
  IsDateString,
  ValidateNested,
  IsNumber,
  Min,
  IsArray,
  IsIn,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

class EventDetailDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsUrl()
  detailImageUrl: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

class TicketDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  type: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

class OrganizerDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsUrl()
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

export class CreateEventDto {
  @IsString()
  eventName: string;

  @IsUrl()
  mainImageUrl: string;

  @ValidateNested({ each: true })
  @Type(() => EventDetailDto)
  eventDetails: EventDetailDto[];

  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];

  @IsArray()
  @IsNumber({}, { each: true })
  giftIds: number[];

  @ValidateNested()
  @Type(() => OrganizerDto)
  organizer: OrganizerDto;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;

  @IsOptional()
  @IsUrl()
  mainImageUrl?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets?: TicketDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventDetailDto)
  eventDetails?: EventDetailDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  giftIds?: number[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizerDto)
  organizer?: OrganizerDto;
}
