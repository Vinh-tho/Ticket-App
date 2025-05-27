"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  HomeIcon, 
  TicketIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import authService from "@/services/auth.service";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Quản lý vé", href: "/dashboard/tickets", icon: TicketIcon },
  { name: "Quản lý người dùng", href: "/dashboard/users", icon: UserGroupIcon },
  { name: "Sự kiện của tôi", href: "/dashboard/my-events", icon: CalendarIcon },
  { name: "Thống kê", href: "/dashboard/analytics", icon: ChartBarIcon },
  { name: "Cài đặt", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Kiểm tra xác thực khi component mount
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      if (!isAuth) {
        router.push('/login');
        return;
      }
      
      const userData = authService.getCurrentUser();
      setUser(userData);
    };
    
    checkAuth();
  }, [router]);
  
  const handleLogout = async () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Mobile sidebar */}
      <div className={`${sidebarOpen ? "fixed" : "hidden"} inset-0 z-40 flex md:hidden`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/10 backdrop-blur-xl border-r border-white/20 rounded-tr-3xl rounded-br-3xl shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Ticket Admin</span>
            </div>
            <div className="flex flex-col items-center mt-6 mb-6 px-4">
              <div className="rounded-full border-4 border-indigo-400/40 shadow-lg w-16 h-16 flex items-center justify-center bg-gradient-to-tr from-indigo-400 via-purple-500 to-cyan-400 text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="mt-2 text-base font-semibold text-white">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-300">{user?.email || 'admin@example.com'}</div>
            </div>
            <nav className="mt-2 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`$ {
                    pathname === item.href
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  } group flex items-center px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200`}
                >
                  <item.icon
                    className={`$ {
                      pathname === item.href
                        ? "text-white"
                        : "text-indigo-300 group-hover:text-white"
                    } mr-4 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-white/20 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 group block w-full flex items-center hover:bg-red-500/10 rounded-2xl px-3 py-2 transition-all"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 text-red-400 group-hover:text-red-500" />
              <span className="ml-3 text-base font-medium text-red-300 group-hover:text-red-500">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 bg-white/10 backdrop-blur-xl border-r border-white/20 rounded-tr-3xl rounded-br-3xl shadow-2xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-8">
                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Ticket Admin</span>
              </div>
              <div className="flex flex-col items-center mt-8 mb-8 px-4">
                <div className="rounded-full border-4 border-indigo-400/40 shadow-lg w-20 h-20 flex items-center justify-center bg-gradient-to-tr from-indigo-400 via-purple-500 to-cyan-400 text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="mt-3 text-lg font-semibold text-white">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-300">{user?.email || 'admin@example.com'}</div>
              </div>
              <nav className="mt-2 flex-1 px-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`$ {
                      pathname === item.href
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-lg"
                        : "text-gray-200 hover:bg-white/10 hover:text-white"
                    } group flex items-center px-4 py-3 text-base font-medium rounded-2xl transition-all duration-200`}
                  >
                    <item.icon
                      className={`$ {
                        pathname === item.href
                          ? "text-white"
                          : "text-indigo-300 group-hover:text-white"
                      } mr-4 flex-shrink-0 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-white/20 p-6">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 w-full group flex items-center hover:bg-red-500/10 rounded-2xl px-3 py-2 transition-all"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6 text-red-400 group-hover:text-red-500" />
                <span className="ml-3 text-base font-medium text-red-300 group-hover:text-red-500">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-col w-0 flex-1">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-indigo-400 hover:text-white hover:bg-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-8 w-8" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1 relative z-0 focus:outline-none bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 min-h-screen">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 