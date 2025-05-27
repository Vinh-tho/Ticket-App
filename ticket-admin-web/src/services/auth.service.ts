import api from './api';

interface LoginResponse {
  token: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

class AuthService {
  async login(data: LoginData): Promise<any> {
    try {
      const response = await api.post('/admin/login', data);
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<any> {
    try {
      // Thêm role admin vào dữ liệu đăng ký
      const registerData = {
        ...data,
        role: 'admin'
      };
      
      const response = await api.post('/admin/register', registerData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    return !!(token && user);
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('admin_user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.logout(); // Nếu có lỗi với dữ liệu user, đăng xuất để làm mới
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }
}

export default new AuthService(); 