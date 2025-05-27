"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.register({ name, email, password, phone });
      router.push("/login?registered=true");
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side: Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="max-w-md text-center">
            {/* Logo */}
            <div className="relative mb-8">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-400 via-purple-500 to-cyan-400 flex items-center justify-center text-white text-4xl font-bold shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  TA
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-400 via-purple-500 to-cyan-400 blur-xl opacity-50 animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 mb-6">
              Ticket Admin
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Gia nhập cộng đồng quản lý sự kiện chuyên nghiệp và hiệu quả
            </p>
            
            {/* Feature highlights */}
            <div className="space-y-4 text-left">
              {[
                "🚀 Thiết lập nhanh chóng",
                "🎨 Giao diện thân thiện",
                "📈 Phân tích thông minh",
                "🛡️ Bảo mật tối ưu"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-300 animate-fade-in-up" style={{animationDelay: `${index * 200}ms`}}>
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
            
            {/* Call to action */}
            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">Tại sao chọn chúng tôi?</h3>
              <p className="text-gray-300 text-sm">
                Hơn 10,000+ người tổ chức sự kiện đã tin tưởng sử dụng nền tảng của chúng tôi để quản lý sự kiện thành công.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-400 via-purple-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-xl mb-4">
                TA
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Ticket Admin
              </h2>
            </div>

            {/* Form Card */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Tạo tài khoản mới</h3>
                <p className="text-gray-300">Bắt đầu hành trình quản lý sự kiện</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Họ tên</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Số điện thoại</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="0123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">Xác nhận mật khẩu</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 backdrop-blur-sm"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 border border-red-400/30 text-red-300 rounded-2xl backdrop-blur-sm animate-shake">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang đăng ký...</span>
                      </>
                    ) : (
                      <>
                        <span>Tạo tài khoản</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Divider */}
              <div className="mt-8 flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-sm text-gray-400">hoặc</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-300">
                  Đã có tài khoản?{" "}
                  <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold hover:from-indigo-300 hover:to-purple-300 transition-all duration-300">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        .bg-grid-white\/\[0\.02\] {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        .bg-grid-16 {
          background-size: 16px 16px;
        }
      `}</style>
    </div>
  );
}