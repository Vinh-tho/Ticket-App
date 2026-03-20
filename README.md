# Ticket App

Hệ thống đặt vé sự kiện âm nhạc đa nền tảng, gồm:

- Backend API (NestJS + TypeORM + MySQL)
- Admin Web (Next.js) cho quản trị viên/ban tổ chức
- Mobile App (Expo React Native) cho người dùng cuối

README này mô tả toàn bộ dự án ở trạng thái hiện tại của repository, bao gồm:

- Kiến trúc tổng thể
- Cách cài đặt và chạy từng phần
- Cấu hình môi trường
- Tóm tắt API và mô hình dữ liệu
- Danh sách vấn đề hiện tại cần hoàn thiện để chạy full-stack ổn định

## 1. Tổng quan nghiệp vụ

Hệ thống phục vụ các luồng chính:

- Tìm kiếm và xem chi tiết sự kiện
- Tạo sự kiện, lịch diễn, loại vé, quà tặng đi kèm
- Chọn ghế theo khu vực, giữ ghế, thanh toán VNPay
- Quản lý đơn hàng và vé đã mua
- Gửi email xác nhận thanh toán
- Gửi push notification (Expo)

Các ràng buộc nghiệp vụ chính:

- Không bán vượt số lượng vé
- Tránh trùng ghế
- Đồng bộ trạng thái ghế/vé theo lịch diễn
- Hỗ trợ nhắc thanh toán và nhắc sự kiện sắp diễn ra

## 2. Kiến trúc hệ thống

Luồng tổng thể:

1. Mobile App và Admin Web gọi Backend qua REST API.
2. Backend xử lý nghiệp vụ, ghi/đọc MySQL qua TypeORM.
3. Backend tích hợp VNPay cho thanh toán.
4. Backend gửi email bằng Nodemailer.
5. Backend gửi thông báo đẩy qua Expo Push Notification.

Tài liệu sơ đồ:

- Kiến trúc: ./BaoCaoDoAn/assets/kiến%20trúc%20hệ%20thống.png
- ERD: ./BaoCaoDoAn/assets/ERD.png
- Use Case: ./BaoCaoDoAn/assets/use%20case.png
- Phân rã chức năng: ./BaoCaoDoAn/assets/Biểu%20đồ%20phân%20rã%20chức%20năng.png

## 3. Công nghệ sử dụng

Backend:

- NestJS 10
- TypeORM
- MySQL
- JWT + Passport
- Nodemailer
- Expo Server SDK

Admin Web:

- Next.js 15
- React 19
- Tailwind CSS
- Axios

Mobile App:

- Expo SDK 53
- React Native 0.79
- Expo Router
- Axios
- AsyncStorage + SecureStore
- Expo Notifications

## 4. Cấu trúc repository

```text
Ticket-App/
├── BaoCaoDoAn/              # Tài liệu báo cáo và assets sơ đồ
├── ticket-backend/          # NestJS backend
├── ticket-admin-web/        # Next.js admin web
├── ticket-frontend/         # Expo React Native mobile app
└── README.md                # Tài liệu tổng (file này)
```

## 5. Yêu cầu môi trường

Khuyến nghị:

- Node.js >= 18
- npm >= 9
- MySQL >= 8
- Git

Cho mobile:

- Expo Go trên thiết bị thật hoặc emulator
- Android Studio/Xcode (nếu build native)

## 6. Cài đặt nhanh toàn dự án

Từ thư mục gốc:

```bash
cd ticket-backend
npm install

cd ../ticket-admin-web
npm install

cd ../ticket-frontend
npm install
```

## 7. Cấu hình môi trường

### 7.1 Backend (.env)

Tạo file `ticket-backend/.env`:

```env
# App
PORT=3001
API_SECRET=change_this_secret

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=ticket-box

# JWT (khuyến nghị dùng env, hiện code đang hard-code)
JWT_SECRET=change_this_jwt_secret

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/payments/vnpay/callback

# Mail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Cloudinary (nếu sử dụng từ backend)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Lưu ý:

- `ticket-backend/src/app.module.ts` đang `synchronize: true` (phù hợp dev, không khuyến nghị production).
- `ticket-backend/src/config/typeorm.config.ts` đang hard-code DB local.

### 7.2 Mobile App

Cập nhật đồng bộ địa chỉ backend tại:

- `ticket-frontend/constants/config.ts` (`BASE_URL`)
- `ticket-frontend/app.json` (`expo.extra.apiUrl`)

Nếu chạy trên thiết bị thật, dùng IP LAN của máy chạy backend (ví dụ: `http://192.168.x.x:3001`).

### 7.3 Admin Web

Admin đang gọi backend qua các service nội bộ. Ở trạng thái hiện tại cần bổ sung các service còn thiếu (xem mục 13) trước khi chạy ổn định.

## 8. Chạy từng ứng dụng

### 8.1 Backend

```bash
cd ticket-backend
npm run start:dev
```

Mặc định chạy tại: `http://localhost:3001`

### 8.2 Admin Web

```bash
cd ticket-admin-web
npm run dev
```

Mặc định: `http://localhost:3000`

### 8.3 Mobile

```bash
cd ticket-frontend
npm start
# hoặc
npx expo start
```

## 9. Scripts chính

Backend (`ticket-backend/package.json`):

- `npm run start:dev`: chạy dev
- `npm run build`: build
- `npm run start:prod`: chạy production build
- `npm run test`: unit test
- `npm run test:e2e`: e2e test
- `npm run migration:generate|run|revert`: migration typeorm

Admin (`ticket-admin-web/package.json`):

- `npm run dev`: dev server
- `npm run build`: build
- `npm run start`: run production
- `npm run lint`: lint

Mobile (`ticket-frontend/package.json`):

- `npm run start`: Expo start
- `npm run android`: chạy Android
- `npm run ios`: chạy iOS
- `npm run web`: chạy web
- `npm run lint`: lint

## 10. API backend hiện có (theo controller)

Auth:

- `POST /auth/register`
- `POST /auth/login`

Admin:

- `POST /admin/register`
- `POST /admin/login`
- `GET /admin`
- `GET /admin/:id`
- `PUT /admin/:id`
- `DELETE /admin/:id`

Users:

- `GET /users`
- `GET /users/profile` (JWT)
- `PUT /users/profile` (JWT)
- `GET /users/buyers-of-my-events` (JWT)

Events:

- `GET /events`
- `GET /events/:id`
- `POST /events` (JWT)
- `PATCH /events/:id` (JWT)
- `PATCH /events/:id/auto-status` (JWT)
- `DELETE /events/:id` (JWT)
- `GET /events/my-events` (JWT)
- `GET /events/my-stats` (JWT)
- `GET /events/gifts` (JWT)

Event Detail:

- `POST /events-detail`
- `GET /events-detail`
- `GET /events-detail/:id`
- `PUT /events-detail/:id`
- `DELETE /events-detail/:id`
- `POST /events-detail/recalculate-capacity`

Tickets:

- `POST /tickets`
- `GET /tickets`
- `GET /tickets/:id`
- `DELETE /tickets/:id`
- `GET /tickets/stats`
- `GET /tickets/of-my-events` (JWT)
- `GET /tickets/my-tickets-stats` (JWT)
- `PUT /tickets/sync-quantity/:eventId`
- `PUT /tickets/sync-status/:eventDetailId`
- `PUT /tickets/sync-all/:eventId`

Seat Status:

- `GET /seat-status`
- `GET /seat-status/event-detail/:eventDetailId`
- `GET /seat-status/event-detail/:eventDetailId/zone-counts`
- `GET /seat-status/event-detail/:eventDetailId/all`
- `PUT /seat-status/:id/status`

Organizer:

- `POST /organizers`
- `GET /organizers`
- `GET /organizers/:id`
- `PATCH /organizers/:id`
- `DELETE /organizers/:id`

Payments (VNPay):

- `POST /payments/vnpay/create`
- `GET /payments/vnpay/callback`
- `GET /payments/vnpay/ipn`

Notifications:

- `GET /notifications` (JWT)
- `PATCH /notifications/mark-read/:id` (JWT)
- `PATCH /notifications/mark-all-read` (JWT)
- `POST /notifications/token` (JWT)
- `POST /notifications` (JWT)
- `POST /notifications/bulk` (JWT)
- `POST /notifications/test-pending-orders`
- `POST /notifications/test-upcoming-events`
- `POST /notifications/test-user-notification`

Mail:

- `GET /mail/test-payment-email/:orderId`

## 11. Mô hình dữ liệu chính

Các entity hiện có trong repository backend:

- `Users`
- `Events`
- `ticket`
- `seat`
- `seat_status`
- `orders`
- `payment`
- `gifts`
- `event_gifts`
- `roles`

Các quan hệ nổi bật:

- User - Orders: 1-N
- Event - EventDetail: 1-N
- Event - Ticket: 1-N
- Ticket - Seat: 1-N
- Seat - SeatStatus: 1-N
- Order - Payment: 1-N
- User - Notification: 1-N
- User - Role: N-N

ERD tham khảo: `BaoCaoDoAn/assets/ERD.png`

## 12. Luồng nghiệp vụ chính

### 12.1 Tạo sự kiện

1. Admin tạo organizer.
2. Admin tạo event + eventDetails + tickets + giftIds.
3. Backend sinh seats theo từng loại vé.
4. Backend sinh seat_status cho từng lịch diễn.

### 12.2 Đặt ghế và thanh toán

1. Mobile lấy seat_status theo eventDetail.
2. User chọn ghế.
3. Tạo order (phần này hiện cần module order hoàn chỉnh).
4. Gọi `POST /payments/vnpay/create` để lấy URL VNPay.
5. VNPay callback về backend để cập nhật trạng thái order/payment.
6. Backend gửi email và notification sau thanh toán thành công.

### 12.3 Thông báo định kỳ

- Cron nhắc đơn hàng pending.
- Cron nhắc sự kiện sắp diễn ra.

## 13. Trạng thái hiện tại và các điểm cần hoàn thiện

Repository hiện ở trạng thái đang phát triển, có nhiều import chưa đồng bộ file. Cần xử lý các mục dưới đây để chạy full-stack ổn định.

### 13.1 Backend thiếu file/module theo import

Thiếu DTO:

- `src/dto/register.dto.ts`
- `src/dto/event.dto.ts`
- `src/dto/admin.dto.ts`
- `src/dto/create-order.dto.ts`

Thiếu entity:

- `src/entities/events-detail.entity.ts`
- `src/entities/order-detail.entity.ts`
- `src/entities/organizer.entity.ts`
- `src/entities/Notification.ts`

Thiếu module:

- `src/modules/order/*`
- `src/modules/seat/*`
- `src/modules/roles/*`
- `src/modules/gifts/*`
- `src/modules/event-gifts/*`

Ngoài ra có thư mục/chức năng bị trùng lặp:

- `src/modules/event-detail/*` và `src/modules/events/event-detail/*`
- `src/modules/admin/*` và `src/modules/events/admin/*`

### 13.2 Admin Web thiếu service/page theo import

Thiếu service:

- `src/services/api.ts`
- `src/services/auth.service.ts`
- `src/services/user.service.ts`

Thiếu page:

- `src/app/login/page.tsx` (nhưng app đang redirect tới `/login`)

### 13.3 Mobile thiếu nhiều component/screen theo import

Thiếu route/screen:

- `app/LoginScreen.tsx`

Thiếu component trong `index_creen`:

- `Header.tsx`
- `TrendingEvent.tsx`
- `Recommendation.tsx`

Thiếu component trong `EventsDetailScreen`:

- `Header.tsx`
- `Banner.tsx`
- `EventInfo.tsx`
- `Introduction.tsx`
- `TermsAndConditions.tsx`

Thiếu component trong `seat_screen`:

- `EventInfo.tsx`
- `FixedButtons.tsx`
- `SeatDetailModal.tsx`

Thiếu component trong `payment_screen`:

- `PaymentHeader.tsx`
- `PaymentEventInfo.tsx`
- `PaymentCountdown.tsx`
- `PaymentTicketInfo.tsx`
- `PaymentGiftSelect.tsx`

Thiếu component trong `Ticket`:

- `TicketList.tsx`
- `utils.ts`

Thiếu component trong `account_screens`:

- `AccountScreen.tsx`
- `ProfileScreen.tsx`

## 14. Bảo mật và cấu hình cần cải thiện

Các điểm cần xử lý trước khi triển khai production:

- JWT secret đang hard-code trong `auth.module.ts` và `jwt.strategy.ts`.
- Một số thông tin nhạy cảm xuất hiện trong tài liệu/script cũ.
- URL backend và cloud config đang hard-code ở nhiều nơi.
- Cần chuẩn hóa toàn bộ về `.env` và không commit secret lên repository.

## 15. Kiểm thử và xác minh

Backend:

```bash
cd ticket-backend
npm run test
npm run test:e2e
```

Admin:

```bash
cd ticket-admin-web
npm run lint
npm run build
```

Mobile:

```bash
cd ticket-frontend
npm run lint
```

## 16. Tài liệu liên quan

- Báo cáo markdown: `BaoCaoDoAn/BaoCaoDoAn.md`
- Báo cáo PDF: `BaoCaoDoAn/Báo_cáo_đồ_án_đa_nền_tảng.pdf`
- Tài liệu backend mail: `ticket-backend/src/modules/mail/README.md`

## 17. Hướng dẫn tiếp theo cho team

Để đưa dự án về trạng thái chạy ổn định theo đúng kiến trúc hiện tại:

1. Đồng bộ file import còn thiếu (ưu tiên backend trước).
2. Hoàn thiện module Order + Seat để khớp luồng mobile/admin.
3. Chuẩn hóa auth service ở admin web và route login.
4. Bổ sung các component/screen thiếu trong mobile.
5. Chuẩn hóa toàn bộ biến môi trường và loại bỏ thông tin nhạy cảm khỏi mã nguồn.
