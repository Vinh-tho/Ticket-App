# Hướng dẫn cấu hình và sử dụng tính năng gửi email

## Cài đặt

Trước tiên, cài đặt các gói phụ thuộc cần thiết:

```
npm install --save nodemailer @types/nodemailer --legacy-peer-deps
```

## Cấu hình Gmail

Để sử dụng tính năng gửi email với Gmail, bạn cần:

1. Tạo file `.env` trong thư mục gốc của dự án nếu chưa có và thêm các biến môi trường sau:

```
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-password
```

2. Để có được mật khẩu ứng dụng (App Password):
   - Truy cập vào [Quản lý tài khoản Google](https://myaccount.google.com/)
   - Chọn "Bảo mật"
   - Trong mục "Đăng nhập vào Google", chọn "Mật khẩu ứng dụng" (lưu ý: bạn cần bật xác thực 2 bước trước)
   - Tạo mật khẩu ứng dụng mới và sử dụng cho biến `EMAIL_PASSWORD`

3. Khởi động lại server để áp dụng các cài đặt mới

## Cách hoạt động của chức năng gửi email

1. **Quy trình gửi email sau khi thanh toán**:
   - Khi người dùng thanh toán thành công, `PaymentsService` sẽ tự động gọi `MailService` để gửi email xác nhận
   - File `payments.service.ts` trong hàm `handleVNPayCallback` sẽ tạo đối tượng `paymentInfo` và gọi `mailService.sendPaymentConfirmationEmail()`

2. **Nội dung email**:
   - Thông tin cá nhân khách hàng (tên, email)
   - Thông tin sự kiện (tên, địa điểm, thời gian)
   - Chi tiết đơn hàng (mã đơn hàng, danh sách vé, giá, phương thức thanh toán)
   - Thông tin liên hệ hỗ trợ

## Kiểm tra chức năng gửi email

Để kiểm tra chức năng gửi email, bạn có thể sử dụng API test đã được tạo sẵn:

```
GET http://localhost:3000/mail/test-payment-email/{orderId}
```

Trong đó `{orderId}` là ID của đơn hàng bạn muốn gửi email xác nhận.

## Sửa lỗi TypeScript

Nếu gặp lỗi TypeScript liên quan đến các thuộc tính của entity, đã có các interfaces được định nghĩa trong `interfaces.ts`. Bạn cần sử dụng các interfaces này thay vì các entity gốc khi làm việc với MailService.

## Tùy chỉnh mẫu email

Để tùy chỉnh mẫu email, bạn có thể chỉnh sửa phương thức `createPaymentConfirmationEmailContent` trong file `mail.service.ts`. Mẫu email hiện tại bao gồm:

1. Header với tiêu đề xác nhận thanh toán
2. Thông tin sự kiện
3. Chi tiết đơn hàng và vé
4. Thông tin liên hệ hỗ trợ
5. Footer với thông tin công ty

## Lưu ý

- Trong môi trường production, bạn nên xem xét sử dụng các dịch vụ gửi email chuyên nghiệp như SendGrid, Mailgun, v.v.
- Không nên commit các thông tin nhạy cảm như mật khẩu vào repository.
- API test chỉ nên được sử dụng trong môi trường phát triển, nên vô hiệu hóa hoặc hạn chế quyền truy cập trong môi trường production. 