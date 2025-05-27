"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  // Hiển thị một thông báo loading đơn giản trong khi redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
