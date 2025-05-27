# 🎫 Ticket App - Ứng dụng Đặt vé Sự kiện

## 📝 Giới thiệu

Ticket App là một ứng dụng di động hiện đại được phát triển bằng Expo/React Native, cho phép người dùng dễ dàng tìm kiếm, đặt vé và quản lý các sự kiện. Ứng dụng cung cấp trải nghiệm người dùng mượt mà và đầy đủ tính năng từ việc duyệt sự kiện đến thanh toán vé.

### Các tính năng chính:

- 🔐 Xác thực người dùng (Đăng nhập/Đăng ký/Quên mật khẩu)
- 🎭 Tìm kiếm và lọc sự kiện
- 📅 Xem chi tiết sự kiện và lịch trình
- 💺 Chọn chỗ ngồi tương tác
- 💳 Thanh toán trực tuyến an toàn
- 🎟️ Quản lý vé đã mua
- 👤 Quản lý tài khoản cá nhân
- 📱 Giao diện responsive trên cả iOS và Android

## 🛠️ Công nghệ sử dụng

### Frontend
- **Expo/React Native**: Lựa chọn để phát triển ứng dụng đa nền tảng với hiệu suất cao
- **TypeScript**: Đảm bảo type-safety và dễ bảo trì code
- **Expo Router**: Routing mạnh mẽ với file-based routing
- **Expo Notifications**: Tích hợp thông báo đẩy
- **React Navigation**: Điều hướng mượt mà trong ứng dụng

### Lý do lựa chọn công nghệ

1. **Expo/React Native**:
   - Phát triển nhanh cho cả iOS và Android
   - Cộng đồng lớn và nhiều thư viện hỗ trợ
   - Hot Reload giúp tăng tốc độ phát triển
   - Dễ dàng triển khai và cập nhật OTA

2. **TypeScript**:
   - Giảm lỗi runtime
   - Code dễ đọc và bảo trì
   - Hỗ trợ IDE tốt hơn

3. **Expo Router & Navigation**:
   - Routing dựa trên file system trực quan
   - Deep linking tích hợp sẵn
   - Hiệu suất tốt và dễ quản lý

## 🚀 Hướng dẫn cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Khởi động ứng dụng:
```bash
npx expo start
```

3. Chạy ứng dụng trên:
- 📱 Thiết bị thật qua Expo Go
- 🤖 Máy ảo Android
- 🍎 Máy ảo iOS

## 📱 Kiểm thử Push Notifications

1. Sử dụng thiết bị thật (không hỗ trợ trên máy ảo)
2. Đăng nhập tài khoản Expo
3. Gửi thông báo test qua API:

```bash
curl -X POST http://your-api-url/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userId": 1, "message": "Thông báo test"}'
```

## 🗂️ Cấu trúc thư mục

```
ticket-frontend/
├── app/                    # Chứa các màn hình chính, routing và layout
│   ├── RegisterScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── SearchScreen.tsx
│   ├── SplashScreen.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── +not-found.tsx
│   ├── (tabs)/             # Các tab điều hướng chính
│   ├── seat_screen/        # Màn hình chọn ghế
│   ├── payment_screen/     # Màn hình thanh toán
│   ├── Ticket/             # Quản lý vé
│   ├── account_screens/    # Quản lý tài khoản
│   ├── EventsDetailScreen/ # Chi tiết sự kiện
│   ├── events_detail/      # Các màn hình chi tiết sự kiện
│   ├── Login_Screen/       # Các màn hình liên quan đăng nhập
│   └── index_creen/        # Trang chủ hoặc các màn hình tổng hợp
├── components/             # Các component dùng lại trong nhiều màn hình
│   ├── ui/                 # Các UI component nhỏ
│   ├── SearchScreen/
│   ├── ProfileScreen/
│   ├── AccountScreen/
│   ├── Collapsible.tsx
│   ├── ExternalLink.tsx
│   ├── HapticTab.tsx
│   ├── HelloWave.tsx
│   ├── ParallaxScrollView.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── services/               # Các hàm/service gọi API backend
│   └── eventService.ts
├── constants/              # Các hằng số, config, màu sắc, API endpoint
│   ├── config.ts
│   ├── api.ts
│   └── Colors.ts
├── hooks/                  # Custom React hooks
│   ├── useNotifications.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
├── types/                  # Định nghĩa các kiểu dữ liệu dùng chung
│   └── react-native-zoom-view.d.ts
├── assets/                 # Hình ảnh, icon, font, media
├── scripts/                # Các script hỗ trợ phát triển
├── .expo/                  # Thư mục cấu hình Expo
├── .vscode/                # Cấu hình cho VSCode
├── package.json
├── app.json
├── tsconfig.json
├── README.md
└── ...
```

**Giải thích nhanh:**
- `app/`: Chứa các màn hình chính, routing, layout và các nhóm màn hình theo nghiệp vụ.
- `components/`: Các thành phần UI dùng lại nhiều nơi.
- `services/`: Các hàm/service gọi API backend.
- `constants/`: Các hằng số, config, màu sắc, endpoint.
- `hooks/`: Custom React hooks.
- `types/`: Định nghĩa kiểu dữ liệu dùng chung.
- `assets/`: Tài nguyên tĩnh (ảnh, icon, font).
- `scripts/`, `.expo/`, `.vscode/`: Hỗ trợ phát triển và cấu hình.

## 📘 Tài liệu tham khảo

- [Tài liệu Expo](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
