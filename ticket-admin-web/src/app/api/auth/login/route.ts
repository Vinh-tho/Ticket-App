import { NextRequest, NextResponse } from "next/server";

// Đây là chỉ để demo, trong thực tế, bạn nên kết nối với backend thật
// và không bao giờ lưu mật khẩu như thế này
const validUsers = [
  {
    email: "admin@example.com",
    password: "admin123",
    name: "Admin",
    role: "admin"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Kiểm tra thông tin đăng nhập
    const user = validUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Trong thực tế, bạn nên sử dụng JWT hoặc session để xác thực
    const userWithoutPassword = {
      email: user.email,
      name: user.name,
      role: user.role
    };

    return NextResponse.json({ 
      success: true, 
      message: "Đăng nhập thành công",
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 