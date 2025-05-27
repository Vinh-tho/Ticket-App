import api from './api';

export interface Ticket {
  id: number;
  eventId: number;
  userId: number;
  seatId?: number;
  type: string;
  price: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  code?: string;
  event?: {
    id: number;
    name: string;
    eventName: string;
    startDate?: string;
    endDate?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  seat?: {
    id: number;
    name: string;
  };
}

export interface TicketStats {
  total: number;
  sold: number;
  reserved: number;
  cancelled: number;
  revenue: number;
}

class TicketService {
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const response = await api.get<Ticket[]>('/ticket');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketById(id: number): Promise<Ticket> {
    try {
      const response = await api.get<Ticket>(`/ticket/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket with id ${id}:`, error);
      throw error;
    }
  }

  async updateTicketStatus(id: number, status: string): Promise<Ticket> {
    try {
      const response = await api.patch<Ticket>(`/ticket/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket status with id ${id}:`, error);
      throw error;
    }
  }

  async getTicketsByEventId(eventId: number): Promise<Ticket[]> {
    try {
      const response = await api.get<Ticket[]>(`/ticket/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tickets for event ${eventId}:`, error);
      throw error;
    }
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    try {
      const response = await api.get<Ticket[]>(`/ticket/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching tickets for user ${userId}:`, error);
      throw error;
    }
  }

  async getTicketStats(): Promise<TicketStats> {
    try {
      const response = await api.get<TicketStats>('/tickets/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      throw error;
    }
  }

  async deleteTicket(id: number): Promise<void> {
    try {
      await api.delete(`/ticket/${id}`);
    } catch (error) {
      console.error(`Error deleting ticket with id ${id}:`, error);
      throw error;
    }
  }

  async getTicketsOfMyEvents(): Promise<Ticket[]> {
    try {
      console.log('Calling getTicketsOfMyEvents API...');
      const token = localStorage.getItem('admin_token');
      console.log('Admin token:', token ? 'exists' : 'not found');
      
      // Log the full request configuration
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      console.log('Request config:', config);

      const response = await api.get<Ticket[]>('/tickets/of-my-events', config);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tickets of my events:', error);
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  }

  async getMyTicketsStats(): Promise<{ totalSold: number; totalRevenue: number }> {
    try {
      const response = await api.get('/tickets/my-tickets-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching my tickets stats:', error);
      throw error;
    }
  }
}

export default new TicketService(); 