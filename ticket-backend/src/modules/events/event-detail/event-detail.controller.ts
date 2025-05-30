import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EventDetailService } from './event-detail.service';
import { CreateEventDetailDto } from '../../dto/create-event-detail.dto';
import { UpdateEventDetailDto } from '../../dto/update-event-detail.dto';

@Controller('events-detail')
export class EventDetailController {
  constructor(private readonly service: EventDetailService) {}

  @Post()
  create(@Body() dto: CreateEventDetailDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDetailDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post('recalculate-capacity')
  async recalculateCapacity() {
    return this.service.recalculateAllCapacities();
  }
}
