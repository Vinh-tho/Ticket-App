import { Order } from '../../entities/order.entity';

// Các interfaces mở rộng cho các entity sẵn có
export interface TicketWithDetails {
  id: number;
  name?: string;
  event?: EventWithDetails;
  // Các thuộc tính khác của Ticket
  [key: string]: any;
}

export interface EventWithDetails {
  id: number;
  name?: string;
  location?: string;
  eventDate?: Date | string;
  // Các thuộc tính khác của Event
  [key: string]: any;
}

export interface SeatWithDetails {
  id: number;
  name?: string;
  // Các thuộc tính khác của Seat
  [key: string]: any;
}

export interface OrderDetailWithRelations {
  id: number;
  ticket?: TicketWithDetails;
  seat?: SeatWithDetails;
  quantity: number;
  unitPrice: number;
  // Các thuộc tính khác của OrderDetail
  [key: string]: any;
}

export interface OrderWithRelations extends Omit<Order, 'orderDetails'> {
  orderDetails?: OrderDetailWithRelations[];
}

export interface PaymentInfo {
  bankCode?: string;
  transactionNo?: string;
  paymentDate?: string;
  amount?: number;
}

export interface EventInfo {
  eventName: string;
  eventLocation: string;
  eventDate: string;
} 