#!/bin/bash

# Kiểm tra tệp .env
if [ -f .env ]; then
  echo "Tệp .env đã tồn tại."
  
  # Kiểm tra và hiển thị thông tin email
  EMAIL_USER=$(grep EMAIL_USER .env | cut -d '=' -f2)
  echo "EMAIL_USER trong .env: $EMAIL_USER"
  
  # Xác nhận mật khẩu email tồn tại (không hiển thị nội dung vì lý do bảo mật)
  if grep -q "EMAIL_PASSWORD" .env; then
    echo "EMAIL_PASSWORD đã được cấu hình."
  else
    echo "CẢNH BÁO: EMAIL_PASSWORD không tìm thấy trong .env"
  fi
else
  echo "CẢNH BÁO: Tệp .env không tồn tại!"
  echo "Hãy tạo tệp .env với nội dung sau:"
  echo "VNPAY_TMN_CODE=ORU4V74D"
  echo "VNPAY_HASH_SECRET=E8ADUGP38PHJ8JWK1CIQA20T2MOPX54"
  echo "VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
  echo "VNPAY_RETURN_URL=http://172.20.10.3:3000/payments/vnpay/callback"
  echo "EMAIL_USER=nguyenvinh1242004@gmail.com"
  echo "EMAIL_PASSWORD=sopnpxrbgoxnblle"
fi

# Thử kết nối SMTP
echo "Kiểm tra kết nối SMTP với Gmail..."
npm run start:debug 