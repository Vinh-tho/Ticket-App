# Kiểm tra tệp .env
if (Test-Path .env) {
    Write-Host "Tệp .env đã tồn tại."
    
    # Đọc nội dung file .env
    $envContent = Get-Content .env
    
    # Kiểm tra EMAIL_USER
    $emailUser = $envContent | Where-Object { $_ -match "EMAIL_USER=" }
    if ($emailUser) {
        Write-Host "EMAIL_USER đã được cấu hình: $emailUser"
    } else {
        Write-Host "CẢNH BÁO: EMAIL_USER không tìm thấy trong .env"
    }
    
    # Kiểm tra EMAIL_PASSWORD
    $emailPass = $envContent | Where-Object { $_ -match "EMAIL_PASSWORD=" }
    if ($emailPass) {
        Write-Host "EMAIL_PASSWORD đã được cấu hình."
    } else {
        Write-Host "CẢNH BÁO: EMAIL_PASSWORD không tìm thấy trong .env"
    }
} else {
    Write-Host "CẢNH BÁO: Tệp .env không tồn tại!"
    Write-Host "Hãy tạo tệp .env với nội dung sau:"
    Write-Host "VNPAY_TMN_CODE=ORU4V74D"
    Write-Host "VNPAY_HASH_SECRET=E8ADUGP38PHJ8JWK1CIQA20T2MOPX54"
    Write-Host "VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    Write-Host "VNPAY_RETURN_URL=http://172.20.10.3:3000/payments/vnpay/callback"
    Write-Host "EMAIL_USER=nguyenvinh1242004@gmail.com"
    Write-Host "EMAIL_PASSWORD=sopnpxrbgoxnblle"
    
    # Tạo file .env
    Write-Host "Đang tạo file .env..."
    @"
VNPAY_TMN_CODE=ORU4V74D
VNPAY_HASH_SECRET=E8ADUGP38PHJ8JWK1CIQA20T2MOPX54
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://172.20.10.3:3000/payments/vnpay/callback

EMAIL_USER=nguyenvinh1242004@gmail.com
EMAIL_PASSWORD=sopnpxrbgoxnblle
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "Đã tạo file .env thành công!"
}

# Khởi động lại server
Write-Host "Đang khởi động lại server với chế độ debug..."
npm run start:debug 