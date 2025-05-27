"use client";

import { useState } from "react";

const TABS = [
  { key: "profile", label: "Thông tin tài khoản" },
  { key: "password", label: "Đổi mật khẩu" },
  { key: "appearance", label: "Giao diện" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 mb-8 text-center">Cài đặt</h1>
      <div className="flex justify-center mb-8 gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 text-sm
              ${tab === t.key
                ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                : "bg-white/10 text-indigo-200 hover:bg-white/20"}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        {tab === "profile" && (
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Tên</label>
              <input type="text" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Tên của bạn" defaultValue="vinh chủ nợ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Email" defaultValue="dsafasd@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Số điện thoại</label>
              <input type="text" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Số điện thoại" defaultValue="09782137821" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:from-indigo-400 hover:to-cyan-400 transition-all">Lưu thay đổi</button>
            </div>
          </form>
        )}
        {tab === "password" && (
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Mật khẩu hiện tại</label>
              <input type="password" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Nhập mật khẩu hiện tại" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Mật khẩu mới</label>
              <input type="password" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Nhập mật khẩu mới" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1">Xác nhận mật khẩu mới</label>
              <input type="password" className="w-full px-4 py-3 rounded-2xl bg-white/20 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Nhập lại mật khẩu mới" />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:from-indigo-400 hover:to-cyan-400 transition-all">Đổi mật khẩu</button>
            </div>
          </form>
        )}
        {tab === "appearance" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-2">Chủ đề giao diện</label>
              <div className="flex gap-4">
                <button className="px-5 py-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-600 text-white font-semibold shadow hover:from-slate-700 hover:to-slate-500 transition-all">Tối</button>
                <button className="px-5 py-2 rounded-2xl bg-gradient-to-r from-white to-gray-200 text-slate-800 font-semibold shadow hover:from-gray-100 hover:to-white transition-all">Sáng</button>
                <button className="px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 text-white font-semibold shadow hover:from-indigo-300 hover:to-cyan-300 transition-all">Tự động</button>
              </div>
            </div>
            <div className="text-white/70">(Tính năng này sẽ sớm hoạt động...)</div>
          </div>
        )}
      </div>
    </div>
  );
} 