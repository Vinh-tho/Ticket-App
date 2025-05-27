import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gift } from '../../entities/gift.entity';
import { CreateGiftDto } from '../../dto/create-gift.dto';

@Injectable()
export class GiftsService {
  constructor(
    @InjectRepository(Gift)
    private giftRepo: Repository<Gift>,
  ) {}

  async create(createGiftDto: CreateGiftDto): Promise<Gift> {
    const gift = this.giftRepo.create({
      ...createGiftDto,
      isActive: createGiftDto.isActive ?? true,
    });
    return this.giftRepo.save(gift);
  }

  async findAll(): Promise<Gift[]> {
    return this.giftRepo.find({ where: { isActive: true } });
  }

  async findAllAdmin(): Promise<Gift[]> {
    return this.giftRepo.find();
  }

  async findOne(id: number): Promise<Gift> {
    const gift = await this.giftRepo.findOne({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID ${id}`);
    }
    return gift;
  }

  async update(id: number, updateData: Partial<CreateGiftDto>): Promise<Gift> {
    const gift = await this.findOne(id);
    Object.assign(gift, updateData);
    return this.giftRepo.save(gift);
  }

  async remove(id: number): Promise<void> {
    const gift = await this.findOne(id);
    gift.isActive = false;
    await this.giftRepo.save(gift);
  }

  async hardDelete(id: number): Promise<void> {
    const result = await this.giftRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID ${id}`);
    }
  }
} 