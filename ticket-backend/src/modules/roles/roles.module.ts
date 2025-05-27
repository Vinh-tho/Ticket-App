import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/Role';
import { RolesService } from './roles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {} 