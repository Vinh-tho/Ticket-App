import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { CreateGiftDto } from '../../dto/create-gift.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly giftsService: GiftsService) {}

  @Get()
  async findAll() {
    try {
      const gifts = await this.giftsService.findAll();
      return {
        success: true,
        data: gifts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách quà tặng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const gift = await this.giftsService.findOne(id);
      return {
        success: true,
        data: gift,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Không tìm thấy quà tặng',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createGiftDto: CreateGiftDto) {
    try {
      const gift = await this.giftsService.create(createGiftDto);
      return {
        success: true,
        message: 'Tạo quà tặng thành công',
        data: gift,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi tạo quà tặng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateGiftDto>,
  ) {
    try {
      const gift = await this.giftsService.update(id, updateData);
      return {
        success: true,
        message: 'Cập nhật quà tặng thành công',
        data: gift,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi cập nhật quà tặng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.giftsService.remove(id);
      return {
        success: true,
        message: 'Vô hiệu hóa quà tặng thành công',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi vô hiệu hóa quà tặng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard')
  async hardDelete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.giftsService.hardDelete(id);
      return {
        success: true,
        message: 'Xóa quà tặng thành công',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi xóa quà tặng',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async findAllAdmin() {
    try {
      const gifts = await this.giftsService.findAllAdmin();
      return {
        success: true,
        data: gifts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Lỗi khi lấy danh sách quà tặng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 