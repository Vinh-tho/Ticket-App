import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventGift } from '../../entities/event-gift.entity';
import { Event } from '../../entities/Events';
import { Gift } from '../../entities/gift.entity';
import { AddGiftToEventDto, AddGiftsToEventDto } from '../../dto/event-gift.dto';

@Injectable()
export class EventGiftsService {
  private readonly logger = new Logger(EventGiftsService.name);

  constructor(
    @InjectRepository(EventGift)
    private eventGiftRepo: Repository<EventGift>,
    
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    
    @InjectRepository(Gift)
    private giftRepo: Repository<Gift>,
  ) {}

  async addGiftToEvent(eventId: number, dto: AddGiftToEventDto): Promise<EventGift> {
    // Kiểm tra sự kiện và quà tặng tồn tại
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID ${eventId}`);
    }

    const gift = await this.giftRepo.findOne({ where: { id: dto.giftId, isActive: true } });
    if (!gift) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID ${dto.giftId}`);
    }

    // Kiểm tra xem liên kết đã tồn tại chưa
    const existingLink = await this.eventGiftRepo.findOne({
      where: { eventId, giftId: dto.giftId }
    });

    if (existingLink) {
      this.logger.log(`Liên kết giữa sự kiện ${eventId} và quà tặng ${dto.giftId} đã tồn tại`);
      return existingLink;
    }

    // Tạo liên kết mới
    const eventGift = this.eventGiftRepo.create({
      eventId,
      giftId: dto.giftId,
    });

    return this.eventGiftRepo.save(eventGift);
  }

  async addMultipleGiftsToEvent(eventId: number, dto: AddGiftsToEventDto): Promise<EventGift[]> {
    // Kiểm tra sự kiện tồn tại
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID ${eventId}`);
    }

    // Kiểm tra danh sách quà tặng
    const gifts = await this.giftRepo.find({
      where: { id: In(dto.giftIds), isActive: true }
    });

    if (gifts.length !== dto.giftIds.length) {
      throw new BadRequestException('Một số quà tặng không tồn tại hoặc không hoạt động');
    }

    // Lấy danh sách liên kết hiện tại
    const existingLinks = await this.eventGiftRepo.find({
      where: { eventId }
    });
    
    // Tạo map các quà tặng đã có
    const existingGiftIds = new Set(existingLinks.map(link => link.giftId));
    
    // Chỉ thêm mới những quà tặng chưa có
    const newGiftIds = dto.giftIds.filter(giftId => !existingGiftIds.has(giftId));
    
    this.logger.log(`Adding new gift links: ${JSON.stringify(newGiftIds)}`);
    
    // Tạo các liên kết mới
    const newEventGifts = newGiftIds.map(giftId => 
      this.eventGiftRepo.create({
        eventId,
        giftId,
      })
    );

    // Lưu các liên kết mới
    const savedGifts = newEventGifts.length > 0 
      ? await this.eventGiftRepo.save(newEventGifts)
      : [];
    
    // Trả về tất cả liên kết (cũ + mới)
    return [...existingLinks, ...savedGifts];
  }

  async removeGiftFromEvent(eventId: number, giftId: number): Promise<void> {
    const result = await this.eventGiftRepo.delete({
      eventId,
      giftId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy liên kết giữa sự kiện ${eventId} và quà tặng ${giftId}`);
    }
  }

  async getGiftsByEvent(eventId: number): Promise<Gift[]> {
    // Kiểm tra sự kiện tồn tại
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID ${eventId}`);
    }

    // Lấy tất cả liên kết của sự kiện
    const eventGifts = await this.eventGiftRepo.find({
      where: { eventId },
      relations: ['gift'],
    });

    // Trả về danh sách quà tặng
    return eventGifts.map(eg => eg.gift).filter(gift => gift.isActive);
  }

  async getEventsByGift(giftId: number): Promise<Event[]> {
    // Kiểm tra quà tặng tồn tại
    const gift = await this.giftRepo.findOne({ where: { id: giftId } });
    if (!gift) {
      throw new NotFoundException(`Không tìm thấy quà tặng với ID ${giftId}`);
    }

    // Lấy tất cả liên kết của quà tặng
    const eventGifts = await this.eventGiftRepo.find({
      where: { giftId },
      relations: ['event'],
    });

    // Trả về danh sách sự kiện
    return eventGifts.map(eg => eg.event);
  }

  async replaceEventGifts(eventId: number, dto: AddGiftsToEventDto): Promise<EventGift[]> {
    // Kiểm tra sự kiện tồn tại
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID ${eventId}`);
    }

    // Kiểm tra danh sách quà tặng
    const gifts = await this.giftRepo.find({
      where: { id: In(dto.giftIds), isActive: true }
    });

    if (gifts.length !== dto.giftIds.length) {
      throw new BadRequestException('Một số quà tặng không tồn tại hoặc không hoạt động');
    }

    this.logger.log(`Replacing gifts for event ${eventId} with: ${JSON.stringify(dto.giftIds)}`);
    
    // Xóa tất cả liên kết hiện tại
    await this.eventGiftRepo.delete({ eventId });

    // Tạo các liên kết mới
    const eventGifts = dto.giftIds.map(giftId => 
      this.eventGiftRepo.create({
        eventId,
        giftId,
      })
    );

    return this.eventGiftRepo.save(eventGifts);
  }
} 