export interface Ticket {
  id: string;
  eventName: string;
  type: string;
  seat: string;
  price: number;
  quantity: number;
  eventDate?: string;
  location?: string;
  eventId?: number;
  eventDetailId?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  tickets: Ticket[];
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface TicketOrder extends Order {
  // For backward compatibility
  eventName: string;
  type: string;
  seat: string;
  price: number;
  quantity: number;
  eventDate?: string;
  location?: string;
}

export interface TicketItemProps {
  item: TicketOrder;
  onPress: (ticket: TicketOrder) => void;
}

export interface TicketModalProps {
  visible: boolean;
  onClose: () => void;
  ticket: TicketOrder | null;
}

export interface EmptyTicketListProps {
  onBrowsePress: () => void;
}

export interface TicketListProps {
  tickets: TicketOrder[];
  onTicketPress: (ticket: TicketOrder) => void;
  refreshing: boolean;
  onRefresh: () => void;
  onBrowsePress: () => void;
} 