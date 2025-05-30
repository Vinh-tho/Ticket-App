import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDetailDto } from './create-event-detail.dto';

export class UpdateEventDetailDto extends PartialType(CreateEventDetailDto) {}
