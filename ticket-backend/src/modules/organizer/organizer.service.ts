import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organizer } from '../../entities/organizer.entity';
import { CreateOrganizerDto, UpdateOrganizerDto } from '../../dto/organizer.dto';

@Injectable()
export class OrganizerService {
  constructor(
    @InjectRepository(Organizer)
    private organizerRepository: Repository<Organizer>,
  ) {}

  async create(createOrganizerDto: CreateOrganizerDto): Promise<Organizer> {
    const organizer = this.organizerRepository.create(createOrganizerDto);
    return await this.organizerRepository.save(organizer);
  }

  async findAll(): Promise<Organizer[]> {
    return await this.organizerRepository.find();
  }

  async findOne(id: number): Promise<Organizer> {
    const organizer = await this.organizerRepository.findOne({ where: { id } });
    if (!organizer) {
      throw new NotFoundException(`Organizer with ID ${id} not found`);
    }
    return organizer;
  }

  async update(id: number, updateOrganizerDto: UpdateOrganizerDto): Promise<Organizer> {
    await this.organizerRepository.update(id, updateOrganizerDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.organizerRepository.delete(id);
  }
} 