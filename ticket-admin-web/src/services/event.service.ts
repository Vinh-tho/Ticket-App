import api from './api';

export interface EventDetail {
  id?: number;
  description: string;
  location: string;
  detailImageUrl: string;
  startTime: string;
  endTime: string;
  status?: string;
  capacity?: number;
}

export interface Ticket {
  id?: number;
  type: string;
  price: number;
  quantity: number;
  status?: string;
}

export interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface EventGift {
  id: number;
  eventId: number;
  giftId: number;
  // Nếu backend có trả về object gift thì thêm dòng sau:
  // gift?: Gift;
}

export interface Organizer {
  id?: number;
  name: string;
  logo_url: string;
  legal_representative: string;
  address: string;
  hotline: string;
  email: string;
  business_license: string;
}

export interface Event {
  id: number;
  eventName: string;
  mainImageUrl: string;
  eventDetails: EventDetail[];
  tickets: Ticket[];
  eventGifts: EventGift[];
  status?: string;
  createdBy?: {
    id: number;
  };
  organizer: Organizer;
}

export interface CreateEventData {
  eventName: string;
  mainImageUrl: string;
  eventDetails: EventDetail[];
  tickets: Ticket[];
  giftIds?: number[];
  organizer: Organizer;
}

export interface UpdateEventData {
  eventName?: string;
  mainImageUrl?: string;
  eventDetails?: EventDetail[];
  tickets?: Ticket[];
  giftIds?: number[];
  organizer?: Organizer;
  status?: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
}

class EventService {
  private static instance: EventService;

  private constructor() {}

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  // Lấy danh sách quà tặng
  async getAllGifts(): Promise<Gift[]> {
    try {
      const response = await api.get<Gift[]>('/events/gifts');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quà tặng:', error);
      throw new Error('Không thể lấy danh sách quà tặng');
    }
  }

  // Lấy chi tiết sự kiện theo ID
  async getEventById(id: number): Promise<Event> {
    try {
      const response = await api.get<Event>(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sự kiện ${id}:`, error);
      throw new Error('Không thể lấy thông tin sự kiện');
    }
  }

  // Cập nhật sự kiện
  async updateEvent(id: number, data: UpdateEventData): Promise<Event> {
    try {
      const response = await api.patch<Event>(`/events/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sự kiện ${id}:`, error);
      throw new Error('Không thể cập nhật sự kiện');
    }
  }

  // Lấy tất cả sự kiện
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await api.get<Event[]>('/events');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện:', error);
      throw new Error('Không thể lấy danh sách sự kiện');
    }
  }

  // Tạo sự kiện mới
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      const response = await api.post<Event>('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo sự kiện:', error);
      throw new Error('Không thể tạo sự kiện mới');
    }
  }

  // Xóa sự kiện
  async deleteEvent(id: number): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      console.error(`Lỗi khi xóa sự kiện ${id}:`, error);
      throw new Error('Không thể xóa sự kiện');
    }
  }

  // Lấy thống kê sự kiện
  async getEventStats(): Promise<EventStats> {
    try {
      const response = await api.get<EventStats>('/events/stats');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sự kiện:', error);
      throw new Error('Không thể lấy thống kê sự kiện');
    }
  }

  // Lấy danh sách sự kiện của tôi
  async getMyEvents(): Promise<Event[]> {
    try {
      const response = await api.get<Event[]>('/events/my-events');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện của bạn:', error);
      throw new Error('Không thể lấy danh sách sự kiện của bạn');
    }
  }

  // Lấy thống kê sự kiện của admin hiện tại
  async getMyStats(): Promise<EventStats> {
    try {
      const response = await api.get<EventStats>('/events/my-stats');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê sự kiện của bạn:', error);
      throw new Error('Không thể lấy thống kê sự kiện của bạn');
    }
  }
}

export default EventService.getInstance(); 