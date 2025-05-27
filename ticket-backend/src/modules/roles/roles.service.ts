import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/Role';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async create(name: string, description?: string): Promise<Role> {
    const role = this.rolesRepository.create({
      name,
      description,
    });
    return this.rolesRepository.save(role);
  }

  async update(id: number, name: string, description?: string): Promise<Role> {
    await this.rolesRepository.update(id, { name, description });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }
} 