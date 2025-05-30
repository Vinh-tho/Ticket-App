import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizerService } from './organizer.service';
import { OrganizerController } from './organizer.controller';
import { Organizer } from '../../entities/organizer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer])],
  controllers: [OrganizerController],
  providers: [OrganizerService],
  exports: [OrganizerService],
})
export class OrganizerModule {} 