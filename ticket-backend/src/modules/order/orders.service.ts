import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { Users } from '../../entities/Users';
import { Ticket } from '../../entities/ticket.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { EventDetail } from '../../entities/events-detail.entity';
import { Seat } from '../../entities/Seat';
import { Gift } from '../../entities/gift.entity';
import { SeatStatus } from '../../entities/seat-status.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderDetail)
    private itemRepo: Repository<OrderDetail>,

    @InjectRepository(Users)
    private userRepo: Repository<Users>,

    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,

    @InjectRepository(EventDetail)
    private eventDetailRepo: Repository<EventDetail>,

    @InjectRepository(Seat)
    private seatRepo: Repository<Seat>,

    private seatStatusService: SeatStatusService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      this.logger.log('Received createOrderDto: ' + JSON.stringify(createOrderDto, null, 2));

      const user = await this.userRepo.findOneBy({ id: createOrderDto.userId });
      if (!user) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      const items: OrderDetail[] = [];

      return await this.orderRepo.manager.transaction(
        async (transactionalEntityManager) => {
          for (const itemDto of createOrderDto.items) {
            // Log chi tiết item đang xử lý
            this.logger.log('Processing order item: ' + JSON.stringify(itemDto, null, 2));

            // Kiểm tra seatId
            if (!itemDto.seatId) {
              this.logger.error('Missing seatId in order item: ' + JSON.stringify(itemDto, null, 2));
              throw new BadRequestException('Thiếu thông tin ID ghế');
            }

            // Kiểm tra ghế tồn tại
            const seat = await transactionalEntityManager.findOne(Seat, { 
              where: { id: itemDto.seatId } 
            });
            
            if (!seat) {
              this.logger.error(`Không tìm thấy ghế với ID: ${itemDto.seatId}`);
              throw new NotFoundException(`Không tìm thấy ghế với ID: ${itemDto.seatId}`);
            }

            const ticket = await transactionalEntityManager.findOne(Ticket, {
              where: { id: itemDto.ticketId },
              lock: { mode: 'pessimistic_write' },
            });

            if (!ticket) {
              throw new NotFoundException(
                `Không tìm thấy vé ${itemDto.ticketId}`,
              );
            }

            // Tạo order detail với seatId
            const item = transactionalEntityManager.create(OrderDetail, {
              ticket,
              quantity: itemDto.quantity,
              unitPrice: itemDto.price,
              seat: seat,
              order: undefined,
            });

            // Log order detail đã tạo
            this.logger.log('Created order detail: ' + JSON.stringify(item, null, 2));

            items.push(item);

            ticket.quantity -= itemDto.quantity;
            await transactionalEntityManager.save(ticket);

            // Xử lý seat status
            if (createOrderDto.eventDetailId) {
              const eventDetail = await transactionalEntityManager.findOne(EventDetail, { 
                where: { id: createOrderDto.eventDetailId },
                relations: ['event'],
              });

              if (!eventDetail) {
                this.logger.error(`Không tìm thấy chi tiết sự kiện với ID: ${createOrderDto.eventDetailId}`);
                throw new NotFoundException(`Không tìm thấy chi tiết sự kiện với ID: ${createOrderDto.eventDetailId}`);
              }

              let seatStatus = await transactionalEntityManager.findOne(SeatStatus, {
                where: { seat: { id: seat.id }, eventDetail: { id: eventDetail.id } },
                relations: ['seat', 'eventDetail'],
              });

              if (!seatStatus) {
                seatStatus = transactionalEntityManager.create(SeatStatus, {
                  seat,
                  eventDetail,
                  status: 'held',
                  user,
                });
              } else {
                (seatStatus as any).status = 'booked';
                (seatStatus as any).user = user;
              }
              await transactionalEntityManager.save(seatStatus);
              this.logger.log('Saved seat status: ' + JSON.stringify(seatStatus, null, 2));

              // Cập nhật trạng thái vé sau khi trạng thái ghế thay đổi
              await this.seatStatusService.updateAllTicketsStatus(eventDetail.event.id);
            }
          }

          // Tính tổng tiền
          let total = 0;
          for (const item of items) {
            total += Number(item.unitPrice) * Number(item.quantity);
          }

          // Khởi tạo đơn hàng
          const orderData: any = {
            user,
            totalAmount: total,
            items,
            eventDetailId: createOrderDto.eventDetailId,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Xử lý thông tin quà tặng nếu có
          if (createOrderDto.giftId) {
            try {
              // Thay thế raw query bằng findOne để lấy đối tượng Gift đầy đủ
              const gift = await transactionalEntityManager.findOne(Gift, {
                where: { id: createOrderDto.giftId, isActive: true },
              });

              if (gift) {
                orderData.gift = gift;
                this.logger.log(`Đã thêm quà tặng ${gift.name} vào đơn hàng`);
              } else {
                this.logger.warn(`Không tìm thấy quà tặng ID ${createOrderDto.giftId} hoặc quà không khả dụng`);
              }
            } catch (giftError) {
              this.logger.error(`Lỗi khi thêm quà tặng: ${giftError.message}`);
              // Không ném lỗi, chỉ bỏ qua quà tặng nếu có vấn đề
            }
          }

          const order = transactionalEntityManager.create(Order, orderData);

          // Save order first
          const savedOrder = await transactionalEntityManager.save(order);
          this.logger.log('Saved order: ' + JSON.stringify(savedOrder, null, 2));

          // Update order reference in items and save them
          for (const item of items) {
            item.order = savedOrder;
            this.logger.log('Attempting to save order detail item: ' + JSON.stringify(item, null, 2));
            const savedItem = await transactionalEntityManager.save(item);
            this.logger.log('Saved order detail: ' + JSON.stringify(savedItem, null, 2));
          }

          return savedOrder;
        },
      );
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: ['user', 'orderDetails', 'orderDetails.ticket', 'orderDetails.seat'],
      order: { orderDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<any> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['user', 'orderDetails', 'orderDetails.ticket', 'orderDetails.seat', 'gift'],
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Bổ sung totalLine cho từng orderDetail
    const orderDetailsWithTotal = order.orderDetails.map((item) => ({
      ...item,
      totalLine: Number(item.unitPrice) * Number(item.quantity),
    }));

    return {
      ...order,
      orderDetails: orderDetailsWithTotal,
      totalAmount: order.totalAmount,
    };
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: [
        'orderDetails', 
        'orderDetails.ticket', 
        'orderDetails.ticket.event',
        'orderDetails.ticket.event.eventDetails',
        'orderDetails.seat'
      ],
      order: { orderDate: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
  }

  async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
  ): Promise<Order> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: ['orderDetails', 'orderDetails.ticket', 'orderDetails.seat', 'user'],
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      if (order.status === OrderStatus.PAID) {
        this.logger.log(`Order ${orderId} đã thanh toán, không cần cập nhật lại.`);
        return order;
      }

      if (status === OrderStatus.CANCELLED || status === OrderStatus.FAILED) {
        await this.orderRepo.manager.transaction(
          async (transactionalEntityManager) => {
            for (const item of order.orderDetails) {
              // Trả lại số lượng vé
              const ticket = await transactionalEntityManager.findOne(Ticket, {
                where: { id: item.ticket.id },
                lock: { mode: 'pessimistic_write' },
              });

              if (ticket) {
                ticket.quantity += item.quantity;
                await transactionalEntityManager.save(ticket);
              }
              
              // Chuyển trạng thái ghế về available
              if (item.seat && item.seat.id && order.eventDetailId) {
                const seatStatus = await transactionalEntityManager.findOne(SeatStatus, {
                  where: { seat: { id: item.seat.id }, eventDetail: { id: order.eventDetailId } },
                  relations: ['seat', 'eventDetail'],
                });
                
                if (seatStatus) {
                  this.logger.log(`Đang cập nhật trạng thái ghế #${item.seat.id} từ ${(seatStatus as any).status} về available`);
                  (seatStatus as any).status = 'available';
                  (seatStatus as any).user = null;
                  await transactionalEntityManager.save(seatStatus);
                }
              }
            }
          },
        );
        
        // Gửi thông báo cho người dùng khi đơn hàng bị hủy
        if (order.user && order.user.id) {
          try {
            // Xác định lý do hủy đơn
            const reason = status === OrderStatus.CANCELLED ? "đã bị hủy" : "thanh toán thất bại";
            
            // Lấy tên sự kiện nếu có
            let eventName = "Sự kiện";
            if (order.orderDetails && order.orderDetails.length > 0 && 
                order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
              eventName = order.orderDetails[0].ticket.event.eventName;
            }
            
            const message = `Đơn hàng #${order.id} của bạn cho "${eventName}" ${reason}.`;
            await this.notificationsService.createNotification(order.user.id, message);
            this.logger.log(`Đã gửi thông báo hủy đơn hàng #${order.id} đến người dùng #${order.user.id}`);
          } catch (notifError) {
            this.logger.error(`Lỗi khi gửi thông báo hủy đơn: ${notifError.message}`);
          }
        }
      }

      if (status === OrderStatus.PAID) {
        await this.orderRepo.manager.transaction(async (transactionalEntityManager) => {
          for (const item of order.orderDetails) {
            if (item.seat && item.seat.id && order.eventDetailId) {
              const seatStatus = await transactionalEntityManager.findOne(SeatStatus, {
                where: { seat: { id: item.seat.id }, eventDetail: { id: order.eventDetailId } },
                relations: ['seat', 'eventDetail'],
              });
              if (seatStatus) {
                this.logger.log(`Đang cập nhật trạng thái ghế #${item.seat.id} từ ${(seatStatus as any).status} sang SOLD`);
                (seatStatus as any).status = 'SOLD';
                await transactionalEntityManager.save(seatStatus);
              }
            }
          }
        });
        
        // Gửi thông báo cho người dùng khi đơn hàng đã thanh toán thành công
        if (order.user && order.user.id) {
          try {
            // Lấy tên sự kiện nếu có
            let eventName = "Sự kiện";
            if (order.orderDetails && order.orderDetails.length > 0 && 
                order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
              eventName = order.orderDetails[0].ticket.event.eventName;
            }
            
            const message = `Đơn hàng #${order.id} cho "${eventName}" đã được thanh toán thành công.`;
            await this.notificationsService.createNotification(order.user.id, message);
            this.logger.log(`Đã gửi thông báo thanh toán thành công cho đơn hàng #${order.id} đến người dùng #${order.user.id}`);
          } catch (notifError) {
            this.logger.error(`Lỗi khi gửi thông báo thanh toán thành công: ${notifError.message}`);
          }
        }
      }

      order.status = status;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      this.logger.log(`Order ${orderId} status updated to ${status}`);

      return savedOrder;
    } catch (error) {
      this.logger.error(`Error updating order status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Đồng bộ trạng thái của tất cả các ghế dựa trên trạng thái đơn hàng hiện tại
   * @returns Thông tin về số lượng ghế đã được cập nhật
   */
  async syncAllSeatStatuses(): Promise<{ updatedPaid: number; updatedCancelled: number; total: number }> {
    try {
      this.logger.log('Bắt đầu đồng bộ trạng thái ghế với đơn hàng...');
      
      let updatedPaid = 0;
      let updatedCancelled = 0;
      
      // 1. Lấy tất cả đơn hàng đã thanh toán (PAID)
      const paidOrders = await this.orderRepo.find({
        where: { status: OrderStatus.PAID },
        relations: ['orderDetails', 'orderDetails.seat', 'user'],
      });
      
      // Xử lý các đơn hàng đã thanh toán
      for (const order of paidOrders) {
        this.logger.log(`Đồng bộ trạng thái ghế cho đơn hàng thanh toán #${order.id}`);
        
        await this.orderRepo.manager.transaction(async (transactionalEntityManager) => {
          for (const item of order.orderDetails) {
            if (item.seat && order.eventDetailId) {
              const seatStatus = await transactionalEntityManager.findOne(SeatStatus, {
                where: { 
                  seat: { id: item.seat.id }, 
                  eventDetail: { id: order.eventDetailId } 
                },
                relations: ['seat', 'eventDetail'],
              });
              
              if (seatStatus && seatStatus.status !== 'SOLD') {
                this.logger.log(`Cập nhật ghế #${item.seat.id} từ '${seatStatus.status}' thành 'SOLD'`);
                seatStatus.status = 'SOLD';
                await transactionalEntityManager.save(seatStatus);
                updatedPaid++;
              }
            }
          }
        });
        
        // Gửi thông báo đồng bộ nếu trạng thái ghế đã được cập nhật
        if (updatedPaid > 0 && order.user && order.user.id) {
          try {
            const message = `Đơn hàng #${order.id} đã được xác nhận và ghế của bạn đã được đặt thành công.`;
            await this.notificationsService.createNotification(order.user.id, message);
          } catch (error) {
            this.logger.error(`Lỗi khi gửi thông báo đồng bộ ghế SOLD: ${error.message}`);
          }
        }
      }
      
      // 2. Lấy tất cả đơn hàng đã hủy hoặc thanh toán thất bại
      const cancelledOrders = await this.orderRepo.find({
        where: [
          { status: OrderStatus.CANCELLED },
          { status: OrderStatus.FAILED }
        ],
        relations: ['orderDetails', 'orderDetails.seat', 'orderDetails.ticket', 'orderDetails.ticket.event', 'user'],
      });
      
      // Xử lý các đơn hàng đã hủy hoặc thất bại
      for (const order of cancelledOrders) {
        this.logger.log(`Đồng bộ trạng thái ghế cho đơn hàng đã hủy #${order.id}`);
        
        let orderUpdatedSeats = 0;
        
        await this.orderRepo.manager.transaction(async (transactionalEntityManager) => {
          for (const item of order.orderDetails) {
            if (item.seat && order.eventDetailId) {
              const seatStatus = await transactionalEntityManager.findOne(SeatStatus, {
                where: { 
                  seat: { id: item.seat.id }, 
                  eventDetail: { id: order.eventDetailId } 
                },
                relations: ['seat', 'eventDetail'],
              });
              
              if (seatStatus && seatStatus.status !== 'available') {
                this.logger.log(`Cập nhật ghế #${item.seat.id} từ '${seatStatus.status}' thành 'available'`);
                seatStatus.status = 'available';
                (seatStatus as any).user = null;
                await transactionalEntityManager.save(seatStatus);
                updatedCancelled++;
                orderUpdatedSeats++;
              }
            }
          }
        });
        
        // Gửi thông báo nếu có ghế được cập nhật
        if (orderUpdatedSeats > 0 && order.user && order.user.id) {
          try {
            // Lấy tên sự kiện nếu có
            let eventName = "Sự kiện";
            if (order.orderDetails && order.orderDetails.length > 0 && 
                order.orderDetails[0].ticket && order.orderDetails[0].ticket.event) {
              eventName = order.orderDetails[0].ticket.event.eventName;
            }
            
            const message = `Đơn hàng #${order.id} cho "${eventName}" đã bị hủy và ghế của bạn đã được giải phóng.`;
            await this.notificationsService.createNotification(order.user.id, message);
            this.logger.log(`Đã gửi thông báo giải phóng ghế cho đơn hàng #${order.id}`);
          } catch (error) {
            this.logger.error(`Lỗi khi gửi thông báo đồng bộ ghế available: ${error.message}`);
          }
        }
      }
      
      const totalUpdated = updatedPaid + updatedCancelled;
      this.logger.log(`Hoàn tất đồng bộ trạng thái ghế: ${totalUpdated} ghế đã được cập nhật`);
      
      return {
        updatedPaid,
        updatedCancelled,
        total: totalUpdated
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đồng bộ trạng thái ghế: ${error.message}`);
      throw error;
    }
  }
}
