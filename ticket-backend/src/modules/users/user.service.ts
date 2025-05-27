import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../entities/Users';
import { ILike, Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { Event } from '../../entities/Events';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,
  ) {}

  async createUser(userData: Partial<Users>): Promise<Users> {
    const user = this.userRepository.create(userData);
    const hashPassword = await bcrypt.hash(userData.password!, 10);
    user.password = hashPassword;
    return this.userRepository.save(user);
  }

  findByEmail(email: string) {
    const user = this.userRepository.findOneBy({ email });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmailOrName(email);
    console.log('[validateUser] tìm thấy user:', user);

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[validateUser] mật khẩu đúng:', isMatch);

    if (isMatch) return user;

    return null;
  }

  async findByName(name: string): Promise<Users | null> {
    return this.userRepository.findOneBy({ name });
  }

  async findByEmailOrName(identifier: string): Promise<Users | null> {
    return this.userRepository.findOne({
      where: [{ email: ILike(identifier) }, { name: ILike(identifier) }],
    });
  }

  findAll(): Promise<Users[]> {
    return this.userRepository.find();
  }

  async findById(id: number): Promise<Users> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    return user;
  }

  async getUserProfile(userId: number): Promise<any> {
    const user = await this.findById(userId);
    // Loại bỏ thông tin nhạy cảm như mật khẩu
    const { password, ...userInfo } = user;
    return userInfo;
  }

  async updateUserProfile(userId: number, updateUserDto: UpdateUserDto): Promise<any> {
    const user = await this.findById(userId);
    console.log('Current user:', user);
    console.log('Update data:', updateUserDto);
    
    // Kiểm tra email trùng lặp nếu có thay đổi email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng bởi người dùng khác');
      }
    }
    
    // Cập nhật các trường thông tin mới
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;
    if (updateUserDto.avatar) user.avatar = updateUserDto.avatar;
    if (updateUserDto.email) user.email = updateUserDto.email;
    
    console.log('User before save:', user);
    
    try {
      // Lưu thông tin đã cập nhật
      const updated = await this.userRepository.save(user);
      console.log('User after save:', updated);
      
      // Loại bỏ thông tin nhạy cảm như mật khẩu
      const { password, ...userInfo } = updated;
      return userInfo;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getBuyersOfMyEvents(adminId: number): Promise<Users[]> {
    // 1. Lấy tất cả event do admin này tạo
    const events = await this.eventRepository.find({ where: { createdBy: { id: adminId } } });
    const eventIds = events.map(e => e.id);
    if (eventIds.length === 0) return [];

    // 2. Lấy tất cả orderDetail của các ticket thuộc các event này
    const orderDetails = await this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .leftJoinAndSelect('orderDetail.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoin('orderDetail.ticket', 'ticket')
      .where('ticket.eventId IN (:...eventIds)', { eventIds })
      .getMany();

    // 3. Lấy danh sách user duy nhất
    const users = orderDetails.map(od => od.order.user);
    const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
    return uniqueUsers;
  }
}
