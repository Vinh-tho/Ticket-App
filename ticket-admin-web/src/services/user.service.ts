import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
  role?: string;
}

class UserService {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw error;
    }
  }

  async getBuyersOfMyEvents(): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users/buyers-of-my-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching buyers of my events:', error);
      throw error;
    }
  }
}

export default new UserService(); 