import { TicketOrder } from './types';

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
    case 'đã xác nhận':
    case 'paid':
    case 'đã thanh toán':
      return '#21C064';
    case 'pending':
    case 'chờ xác nhận':
      return '#F7B500';
    case 'unpaid':
    case 'chưa thanh toán':
      return '#FF9500';
    case 'cancelled':
    case 'đã hủy':
      return '#E74C3C';
    case 'used':
    case 'đã sử dụng':
      return '#95A5A6';
    default:
      return '#95A5A6';
  }
};

export const formatStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
      return 'Đã xác nhận';
    case 'pending':
      return 'Chờ xác nhận';
    case 'unpaid':
      return 'Chưa thanh toán';
    case 'cancelled':
      return 'Đã hủy';
    case 'used':
      return 'Đã sử dụng';
    case 'paid':
      return 'Đã thanh toán';
    default:
      return status;
  }
};

export const checkForNewOrUpdatedTickets = (oldTickets: TicketOrder[], newTickets: TicketOrder[]) => {
  if (newTickets.length > oldTickets.length) return true;
  
  for (const newTicket of newTickets) {
    const oldTicket = oldTickets.find(t => t.id === newTicket.id);
    if (oldTicket && oldTicket.status !== newTicket.status) {
      return true;
    }
  }
  
  return false;
};

export const getSampleTickets = (): TicketOrder[] => {
  return [
    {
      id: "T001",
      eventName: "Lễ hội âm nhạc mùa hè 2023",
      type: "VIP",
      seat: "A-12",
      orderDate: "2023-05-15T08:30:00.000Z",
      status: "confirmed",
      eventDate: "2023-06-20T18:00:00.000Z",
      location: "Sân vận động Mỹ Đình, Hà Nội",
      price: 1500000
    },
    {
      id: "T002",
      eventName: "Triển lãm công nghệ 2023",
      type: "Thường",
      seat: "B-05",
      orderDate: "2023-05-10T09:15:00.000Z",
      status: "pending",
      eventDate: "2023-05-25T09:00:00.000Z",
      location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
      price: 350000
    }
  ];
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + ' đ';
}; 