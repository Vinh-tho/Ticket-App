export class CreateOrderDetailDto {
  ticketId: number;
  quantity: number;
  seatId?: number;
  price: number;
}

export class CreateOrderDto {
  userId: number;
  eventDetailId?: number;
  items: CreateOrderDetailDto[];
  giftId?: number;
}
