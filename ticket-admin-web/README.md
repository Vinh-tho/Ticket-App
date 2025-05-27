# 🎫 Ticket Admin Web

## 📝 Giới thiệu

Ticket Admin Web là hệ thống quản trị dành cho ban tổ chức sự kiện, cho phép quản lý sự kiện, vé, người dùng, thống kê doanh thu và các nghiệp vụ liên quan đến bán vé trực tuyến. Ứng dụng này là một phần trong hệ sinh thái Ticket App, giúp tối ưu hóa quy trình vận hành và nâng cao trải nghiệm quản lý.

### Các tính năng chính
- 👤 Quản lý tài khoản người dùng, ban tổ chức
- 🎫 Quản lý sự kiện, vé, trạng thái vé
- 📊 Thống kê doanh thu, số lượng vé bán ra
- 📝 Quản lý thông tin, cập nhật sự kiện
- 🔒 Phân quyền truy cập (admin, user)
- 🌐 Giao diện hiện đại, responsive

## 🛠️ Công nghệ sử dụng
- **Next.js**: Framework React mạnh mẽ, hỗ trợ SSR/SSG, tối ưu SEO và hiệu năng
- **TypeScript**: Giúp code an toàn, dễ bảo trì
- **TailwindCSS**: Xây dựng giao diện nhanh, hiện đại, dễ tuỳ biến
- **React Query**: Quản lý state và fetch dữ liệu hiệu quả
- **Axios**: Giao tiếp API nhanh chóng, dễ mở rộng
- **Jest/Testing Library**: Viết unit test, đảm bảo chất lượng code

### Lý do lựa chọn công nghệ
1. **Next.js**
   - Hỗ trợ server-side rendering, tối ưu SEO cho dashboard quản trị
   - Routing linh hoạt, dễ mở rộng module
   - Cộng đồng lớn, nhiều tài liệu hỗ trợ
2. **TypeScript**
   - Giảm lỗi runtime, tăng năng suất phát triển
   - Dễ dàng refactor, bảo trì dự án lớn
3. **TailwindCSS**
   - Tăng tốc độ xây dựng UI, dễ tuỳ biến theo branding
   - Responsive tốt trên mọi thiết bị
4. **React Query & Axios**
   - Quản lý dữ liệu bất đồng bộ hiệu quả, giảm code boilerplate
   - Dễ dàng tích hợp với backend RESTful API

## 🚀 Hướng dẫn cài đặt & chạy dự án

1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy ứng dụng ở chế độ phát triển:
   ```bash
   npm run dev
   ```
3. Truy cập [http://localhost:3000](http://localhost:3000) để sử dụng dashboard.

## 🗂️ Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx                # Layout tổng thể cho ứng dụng
│   ├── globals.css               # File CSS toàn cục
│   ├── page.tsx                  # Trang chủ
│   ├── login/                    # Trang đăng nhập
│   ├── register/                 # Trang đăng ký
│   ├── api/                      # Các route API (ví dụ: xác thực)
│   │   └── auth/
│   │       └── login/
│   │           └── route.ts      # Xử lý API đăng nhập
│   └── dashboard/                # Khu vực quản trị
│       ├── layout.tsx            # Layout cho dashboard
│       ├── page.tsx              # Trang tổng quan dashboard
│       ├── users/                # Quản lý người dùng
│       │   └── page.tsx
│       ├── tickets/              # Quản lý vé
│       │   └── page.tsx
│       ├── analytics/            # Thống kê, báo cáo
│       │   └── page.tsx
│       ├── settings/             # Cài đặt hệ thống
│       │   └── page.tsx
│       └── my-events/            # Quản lý sự kiện của tôi
│           ├── page.tsx
│           ├── create/           # Tạo sự kiện mới
│           │   └── page.tsx
│           └── edit/             # Chỉnh sửa sự kiện
│               └── [id]/
│                   └── page.tsx
├── services/                     # Các service gọi API backend
│   ├── api.ts
│   ├── auth.service.ts
│   ├── event.service.ts
│   ├── ticket.service.ts
│   └── user.service.ts
```

**Giải thích nhanh:**
- `app/`: Chứa toàn bộ các route, trang, layout và API route của Next.js.
- `dashboard/`: Khu vực quản trị, chia nhỏ theo từng nghiệp vụ (users, tickets, analytics, settings, my-events).
- `services/`: Chứa các hàm/service dùng để gọi API backend, tách biệt logic xử lý dữ liệu khỏi UI.

## 📚 Tài liệu tham khảo
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query](https://tanstack.com/query/latest)
- [Axios](https://axios-http.com/)
