import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    return Promise.reject(error);
  }
);

// Thêm interceptor để gửi token trong mỗi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("admin_token");
    
    // Nếu có token, thêm vào header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      // Chuyển hướng về trang đăng nhập
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api; 