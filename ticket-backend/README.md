# 🎫 Ticket App Backend

## 📝 Giới thiệu

Backend của Ticket App được xây dựng bằng NestJS - một framework Node.js mạnh mẽ và hiện đại. Hệ thống cung cấp REST API để hỗ trợ các chức năng quản lý và đặt vé sự kiện.

## 🏗️ Kiến trúc hệ thống

### Công nghệ sử dụng
- **NestJS**: Framework Node.js với TypeScript
- **MySQL**: Hệ quản trị cơ sở dữ liệu
- **HeidiSQL**: GUI Tool quản lý MySQL
- **TypeORM**: ORM cho database
- **Passport.js**: Xác thực và phân quyền
- **JWT**: Token-based authentication
- **Cloudinary**: Lưu trữ và quản lý hình ảnh
- **Jest**: Unit testing và E2E testing

### Cấu trúc thư mục
```
src/
├── config/         # Cấu hình ứng dụng
├── entities/       # Các entity của database
├── modules/        # Các module chức năng
├── dto/           # Data Transfer Objects
├── guards/        # Guards bảo vệ route
├── middlewares/   # Middleware xử lý request
├── passport/      # Cấu hình passport strategy
└── common/        # Các utility và helper functions
```

## ⚙️ Cài đặt và Phát triển

### Yêu cầu hệ thống
- Node.js >= 16.x
- MySQL >= 8.x
- npm >= 8.x

### Lý do lựa chọn công nghệ

1. **NestJS**
   - Framework Node.js với kiến trúc module rõ ràng, dễ mở rộng
   - Tích hợp TypeScript mặc định giúp code an toàn và dễ bảo trì
   - Dependency Injection pattern giúp code dễ test và tái sử dụng
   - Hỗ trợ Microservices sẵn có
   - Cộng đồng lớn và nhiều thư viện hỗ trợ

2. **MySQL & HeidiSQL**
   - MySQL là CSDL phổ biến, miễn phí và mã nguồn mở
   - Hiệu năng cao và ổn định cho ứng dụng web
   - HeidiSQL cung cấp giao diện trực quan để quản lý database
   - Dễ dàng backup, restore và quản lý dữ liệu
   - Cộng đồng lớn và nhiều tài liệu hướng dẫn tiếng Việt
   - Nhiều hosting hỗ trợ MySQL sẵn có

3. **TypeORM**
   - ORM phổ biến cho TypeScript
   - Tương thích tốt với MySQL
   - Query builder mạnh mẽ và linh hoạt
   - Hỗ trợ migration và seeding
   - Active Record và Data Mapper patterns

4. **Passport.js & JWT**
   - Giải pháp authentication linh hoạt và bảo mật
   - Dễ dàng tích hợp với các provider khác nhau (Google, Facebook)
   - JWT cho phép stateless authentication
   - Hiệu năng tốt và dễ scale

5. **VNPay Integration**
   - Cổng thanh toán phổ biến tại Việt Nam
   - Hỗ trợ nhiều phương thức thanh toán
   - API documentation đầy đủ
   - Sandbox environment cho testing
   - Phí giao dịch cạnh tranh

### Cấu hình môi trường
Tạo file `.env` với các biến môi trường sau:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=12345
DB_DATABASE=ticket-box

# VNPay Configuration
VNPAY_TMN_CODE=0RU4V74D
VNPAY_HASH_SECRET=E8ADUGP338PHJ8JWK1CIQA20T2WOPX54
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://172.20.10.3:3001/payments/vnpay/callback

# Email Configuration
EMAIL_USER=nguyenvinh1242004@gmail.com
EMAIL_PASSWORD=zgqyvguuoqoufnri

### Database Configuration
Dự án sử dụng TypeORM với chế độ `synchronize: true`, có nghĩa là:
- Schema database sẽ tự động được cập nhật dựa trên các Entity
- Không cần chạy migration thủ công
- Phù hợp cho môi trường development
- ⚠️ Lưu ý: Nên tắt tính năng này trong môi trường production để tránh mất dữ liệu

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới token

### Events
- `GET /events` - Lấy danh sách sự kiện
- `GET /events/:id` - Chi tiết sự kiện
- `POST /events` - Tạo sự kiện mới
- `PUT /events/:id` - Cập nhật sự kiện
- `DELETE /events/:id` - Xóa sự kiện

### Tickets
- `GET /tickets` - Lấy danh sách vé
- `POST /tickets` - Đặt vé
- `GET /tickets/:id` - Chi tiết vé
- `PUT /tickets/:id/status` - Cập nhật trạng thái vé

### Users
- `GET /users/profile` - Thông tin người dùng
- `PUT /users/profile` - Cập nhật thông tin
- `GET /users/tickets` - Lịch sử đặt vé

## 📚 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport.js Documentation](http://www.passportjs.org/)
