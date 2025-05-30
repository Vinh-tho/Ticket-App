import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizerService } from './organizer.service';
import { CreateOrganizerDto, UpdateOrganizerDto } from '../../dto/organizer.dto';
import { Organizer } from '../../entities/organizer.entity';

@Controller('organizers')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Post()
  create(@Body() createOrganizerDto: CreateOrganizerDto): Promise<Organizer> {
    return this.organizerService.create(createOrganizerDto);
  }

  @Get()
  findAll(): Promise<Organizer[]> {
    return this.organizerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Organizer> {
    return this.organizerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizerDto: UpdateOrganizerDto,
  ): Promise<Organizer> {
    return this.organizerService.update(+id, updateOrganizerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.organizerService.remove(+id);
  }
} 