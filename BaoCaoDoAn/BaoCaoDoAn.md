# BÁO CÁO ĐỒ ÁN
# HỆ THỐNG ĐẶT VÉ SỰ KIỆN ÂM NHẠC

# MỤC LỤC
- [1. TÓM TẮT NỘI DUNG ĐỒ ÁN](#1-tóm-tắt-nội-dung-đồ-án)
- [2. KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU](#2-khảo-sát-và-phân-tích-yêu-cầu)
  - [2.1. Mô tả yêu cầu nghiệp vụ](#21-mô-tả-yêu-cầu-nghiệp-vụ)
  - [2.2. Sơ đồ phân rã chức năng](#22-sơ-đồ-phân-rã-chức-năng)
  - [2.3. Use Case Diagram](#23-use-case-diagram)
- [3. LỰA CHỌN CÔNG NGHỆ](#3-lựa-chọn-công-nghệ)
- [4. THIẾT KẾ VÀ TRIỂN KHAI](#4-thiết-kế-và-triển-khai)
  - [4.1. Thiết kế giao diện người dùng (UI)](#41-thiết-kế-giao-diện-người-dùng-ui)
  - [4.2. Thiết kế cơ sở dữ liệu](#42-thiết-kế-cơ-sở-dữ-liệu)
  - [4.3. Kiến trúc hệ thống](#43-kiến-trúc-hệ-thống)
- [5. KẾT LUẬN](#5-kết-luận)


## 1. TÓM TẮT NỘI DUNG ĐỒ ÁN
Hệ thống Đặt Vé Sự Kiện Âm Nhạc là một ứng dụng web/mobile được phát triển nhằm cung cấp giải pháp toàn diện cho việc quản lý và đặt vé các sự kiện ca nhạc, giải trí. Hệ thống cho phép người dùng dễ dàng tìm kiếm, đặt vé và thanh toán trực tuyến, đồng thời cung cấp công cụ quản lý hiệu quả cho đơn vị tổ chức sự kiện. Với tính năng đặt vé realtime và tích hợp thanh toán qua VNPay, hệ thống đảm bảo trải nghiệm mua vé an toàn và thuận tiện cho người dùng.

## 2. KHẢO SÁT VÀ PHÂN TÍCH YÊU CẦU

### 2.1. Mô tả yêu cầu nghiệp vụ

**Chức năng chính:**
- Quản lý sự kiện và vé
- Đặt vé và thanh toán trực tuyến
- Quản lý người dùng
- Thống kê và báo cáo

**Người dùng:**
1. Khách hàng:
   - Tìm kiếm và đặt vé sự kiện
   - Thanh toán trực tuyến
   - Xem lịch sử đặt vé
   - Nhận thông báo về sự kiện

2. Quản trị viên:
   - Quản lý sự kiện
   - Quản lý vé và giá vé
   - Quản lý người dùng
   - Xem báo cáo thống kê

**Vấn đề hiện tại cần giải quyết:**
- Đảm bảo không bán trùng vé
- Xử lý thanh toán realtime
- Quản lý thời gian giữ chỗ (15 phút)
- Gửi thông báo tự động
- Xử lý đồng thời nhiều người đặt vé

### 2.2. Sơ đồ phân rã chức năng
Hệ thống được chia thành 5 module chính:

![Sơ đồ phân rã chức năng](./assets/Biểu%20đồ%20phân%20rã%20chức%20năng.png)

1. Quản lý sự kiện
   - Thêm/Sửa/Xóa sự kiện
   - Cập nhật thông tin sự kiện
   - Quản lý địa điểm
   - Quản lý lịch trình

2. Quản lý vé
   - Tạo loại vé
   - Thiết lập giá vé
   - Giới hạn số lượng vé
   - Quản lý ưu đãi

3. Đặt vé & Thanh toán
   - Tìm kiếm & chọn sự kiện
   - Chọn số lượng vé
   - Nhập mã giảm giá
   - Xác nhận & thanh toán
   - Xuất vé điện tử

4. Quản lý người dùng
   - Đăng ký/Đăng nhập
   - Cập nhật thông tin
   - Quản lý vé đã mua

5. Báo cáo & Thống kê
   - Thống kế vé bán
   - Báo cáo doanh thu

### 2.3. Use Case Diagram
Sơ đồ Use Case thể hiện các tác nhân và chức năng:

![Use Case Diagram](./assets/use%20case.png)

**Actors (Tác nhân):**
1. Khách hàng
2. Quản trị viên
3. Hệ thống

**Các Use Case chính:**
1. Quản lý tài khoản
   - Đăng ký
   - Đăng nhập
   - Quản lý thông tin cá nhân

2. Quản lý sự kiện
   - Tạo sự kiện mới
   - Cập nhật thông tin sự kiện
   - Xóa sự kiện

3. Quản lý vé
   - Tạo loại vé
   - Thiết lập giá vé
   - Quản lý số lượng

4. Đặt vé
   - Tìm kiếm sự kiện
   - Chọn vé
   - Thanh toán
   - Nhận vé điện tử

## 3. LỰA CHỌN CÔNG NGHỆ

**Frontend:**
- Mobile App: React Native
- Admin Web: Next.js

**Backend:**
- NestJS (Node.js framework)

**Cơ sở dữ liệu:**
- MySQL Database
- HeldiSql

**Dịch vụ tích hợp:**
- VNPay (Payment Gateway)
- Cloudinary (Image Storage)
- Email Service
- Expo Push Notification

**Công cụ phát triển:**
- VS Code
- Postman
- Git/GitHub

## 4. THIẾT KẾ VÀ TRIỂN KHAI

### 4.1. Thiết kế giao diện người dùng (UI)

*(cần bổ sung ảnh giao diện người dùng vào thư mục assets và thay đường dẫn này)*

### 4.2. Thiết kế cơ sở dữ liệu

![Thiết kế cơ sở dữ liệu](./assets/ERD.png)

Cơ sở dữ liệu bao gồm các bảng chính:

1. **users**
   - id: int (PK)
   - name: varchar(255)
   - email: varchar(255)
   - password: varchar(255)
   - phone: varchar(255)
   - avatar: varchar(255)
   - isActive: boolean
   - createdAt: datetime
   - updatedAt: datetime

2. **events**
   - id: int (PK)
   - eventName: varchar(255)
   - createdBy: int (FK)
   - organizerId: int (FK)
   - status: varchar(255)
   - createdAt: datetime(6)
   - statusByAdmin: tinyint

3. **tickets**
   - id: int (PK)
   - type: varchar(255)
   - price: decimal(10,2)
   - quantity: int
   - status: varchar(255)
   - eventId: int (FK)

4. **orders**
   - id: int (PK)
   - orderDate: datetime
   - updateAt: datetime
   - totalAmount: decimal(10,2)
   - status: varchar(255)
   - userId: int (FK)
   - eventDetailId: int (FK)
   - giftID: int
   - reminderSent: enum ('Chưa nhắc', 'Đã Nhắc')

5. **payments**
   - id: int (PK)
   - amount: decimal(10,2)
   - paymentMethod: varchar(255)
   - paymentStatus: varchar(255)
   - paymentDate: Datetime
   - orderId: int (FK)

**Ghi chú quan hệ giữa các bảng:**
- **users** (1) --- (N) **orders**: Một người dùng có thể có nhiều đơn đặt vé.
- **orders** (1) --- (N) **order_details**: Một đơn đặt vé có thể chứa nhiều loại vé/chỗ ngồi.
- **order_details** (N) --- (1) **tickets**: Mỗi chi tiết đơn hàng ứng với một loại vé.
- **order_details** (N) --- (1) **seat**: Mỗi chi tiết đơn hàng có thể gắn với một ghế cụ thể.
- **orders** (1) --- (N) **payments**: Một đơn đặt vé có thể có nhiều lần thanh toán.
- **events** (1) --- (N) **event_details**: Một sự kiện có nhiều lịch trình/chi tiết sự kiện.
- **event_details** (1) --- (N) **seat_status**: Mỗi lịch trình sự kiện có nhiều trạng thái ghế.
- **seat** (1) --- (N) **seat_status**: Một ghế có nhiều trạng thái (qua các lần đặt/giữ).
- **seat_status** (N) --- (1) **users**: Trạng thái ghế có thể gắn với người dùng giữ/chọn ghế.
- **events** (1) --- (N) **tickets**: Một sự kiện có nhiều loại vé.
- **tickets** (1) --- (N) **seat**: Một loại vé có nhiều ghế.
- **users** (1) --- (N) **notifications**: Một người dùng có thể nhận nhiều thông báo.
- **users** (N) --- (M) **roles**: Một người dùng có thể có nhiều vai trò (qua bảng phụ user_roles).
- **events** (N) --- (1) **organizer**: Mỗi sự kiện thuộc về một đơn vị tổ chức.
- **orders** (N) --- (1) **gift**: Đơn hàng có thể gắn với một quà tặng.

### 4.3. Kiến trúc hệ thống

![Kiến trúc hệ thống](./assets/kiến%20trúc%20hệ%20thống.png)

Hệ thống được thiết kế theo kiến trúc microservices với các thành phần:

1. **Frontend Layer:**
   - Mobile App (React Native)
   - Admin Web (Next.js)

2. **Backend Layer:**
   - Backend API (NestJS)
   - Tích hợp các dịch vụ:
     - Cloudinary cho lưu trữ hình ảnh
     - VNPay cho thanh toán
     - Email Service cho gửi email
     - Expo Push Notification cho thông báo

3. **Database Layer:**
   - MySQL Database
   - HeidiSQL

**Giao tiếp giữa các thành phần:**
- **Mobile App (React Native)** và **Admin Web (Next.js)** giao tiếp với **Backend API (NestJS)** thông qua **HTTP RESTful API**.
- **Backend API** giao tiếp với **MySQL Database** thông qua **ORM/SQL**.
- **Backend API** tích hợp với **VNPay** qua **HTTP API** để xử lý thanh toán.
- **Backend API** gửi và nhận hình ảnh qua **Cloudinary** bằng **HTTP API**.
- **Backend API** gửi email qua **Email Service** (SMTP hoặc API).
- **Backend API** gửi thông báo đẩy qua **Expo Push Notification** (HTTP API).

**Vai trò và chức năng từng thành phần:**
- **Mobile App (React Native):** Ứng dụng di động cho phép người dùng cuối đăng ký, đăng nhập, tìm kiếm sự kiện, đặt vé, thanh toán, nhận thông báo và xem lịch sử đặt vé.
- **Admin Web (Next.js):** Giao diện quản trị cho phép quản trị viên quản lý sự kiện, vé, người dùng, đơn hàng, xem báo cáo thống kê.
- **Backend API (NestJS):** Xử lý toàn bộ logic nghiệp vụ, xác thực người dùng, quản lý session, xử lý đơn hàng, thanh toán, gửi thông báo, tích hợp dịch vụ bên ngoài.
- **MySQL Database:** Lưu trữ toàn bộ dữ liệu hệ thống: người dùng, sự kiện, vé, đơn hàng, thanh toán, trạng thái chỗ ngồi, v.v.
- **VNPay:** Cổng thanh toán trực tuyến, tích hợp qua API để xử lý giao dịch.
- **Cloudinary:** Lưu trữ và quản lý hình ảnh sự kiện, vé, poster.
- **Email Service:** Gửi email xác nhận, thông báo trạng thái đơn hàng, thông báo thay đổi sự kiện.
- **Expo Push Notification:** Gửi thông báo đẩy realtime đến thiết bị di động của người dùng.

**Luồng giao tiếp chính:**
- **Luồng đặt vé:**
  1. Người dùng chọn sự kiện và vé trên Mobile App/Admin Web.
  2. Gửi yêu cầu đặt vé qua HTTP API đến Backend.
  3. Backend kiểm tra số lượng vé, giữ chỗ tạm thời (có thể mở rộng dùng Redis trong tương lai).
  4. Người dùng tiến hành thanh toán qua VNPay (Backend gọi API VNPay).
  5. Sau khi thanh toán thành công, Backend cập nhật trạng thái đơn hàng, gửi email và push notification.
  6. Nếu quá 15 phút không thanh toán, hệ thống sẽ tự động giải phóng vé.
- **Luồng quản trị:**
  1. Admin đăng nhập vào Admin Web.
  2. Thực hiện các thao tác CRUD sự kiện, vé, người dùng qua API.
  3. Xem báo cáo, thống kê doanh thu, số lượng vé bán.
- **Luồng upload ảnh:**
  1. Admin upload ảnh sự kiện/vé.
  2. Backend nhận file, upload lên Cloudinary, lưu link ảnh vào database.

**Bảo mật & hiệu năng:**
- **Xác thực & phân quyền:** Sử dụng JWT cho xác thực người dùng, phân quyền rõ ràng giữa user và admin.
- **Bảo vệ API:** Sử dụng HTTPS, kiểm tra input, chống SQL Injection, XSS.
- **Tối ưu hiệu năng:** Có thể mở rộng sử dụng cache Redis cho dữ liệu truy cập nhiều, tối ưu truy vấn database, sử dụng CDN cho ảnh.

## 5. KẾT LUẬN
Hệ thống Đặt Vé Sự Kiện đã đạt được các mục tiêu đề ra:
- Xây dựng được hệ thống đặt vé hoàn chỉnh, đáp ứng các yêu cầu nghiệp vụ
- Tích hợp thành công các dịch vụ bên thứ ba (thanh toán, thông báo)
- Đảm bảo tính đồng thời và realtime trong quá trình đặt vé
- Cung cấp giao diện quản trị đầy đủ chức năng

**Hướng phát triển tiếp theo:**
1. Tích hợp thêm các phương thức thanh toán khác
2. Phát triển tính năng đặt vé theo nhóm
3. Thêm tính năng scan QR code để check-in tại sự kiện
4. Tối ưu hóa hiệu suất hệ thống cho số lượng người dùng lớn 
