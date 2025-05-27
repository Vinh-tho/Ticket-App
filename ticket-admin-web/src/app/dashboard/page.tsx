"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Ticket, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import eventService from "@/services/event.service";
import ticketService from "@/services/ticket.service";
import userService from "@/services/user.service";

export default function DashboardPage() {
  const router = useRouter();
  const [eventStats, setEventStats] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch all required data in parallel
        const [eventsData, myTicketsStats, myBuyers, activities] = await Promise.all([
          eventService.getMyStats().catch(error => {
            console.error('Error fetching event stats:', error);
            return null;
          }),
          ticketService.getMyTicketsStats().catch(error => {
            console.error('Error fetching my tickets stats:', error);
            return { totalSold: 0, totalRevenue: 0 };
          }),
          userService.getBuyersOfMyEvents().catch(error => {
            console.error('Error fetching buyers:', error);
            return [];
          }),
          // Giả lập hoạt động gần đây bằng cách kết hợp dữ liệu từ các nguồn khác nhau
          Promise.all([
            eventService.getMyEvents().then(events => 
              events.slice(0, 2).map(event => ({
                type: 'event',
                title: `Sự kiện ${event.eventName} đã được tạo`,
                time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                icon: 'Calendar'
              }))
            ).catch(error => {
              console.error('Error fetching recent events:', error);
              return [];
            }),
            ticketService.getTicketsOfMyEvents().then(tickets =>
              tickets.slice(0, 2).map(ticket => ({
                type: 'ticket',
                title: `Vé mới được bán cho sự kiện ${ticket.event?.eventName}`,
                time: new Date(Date.now() - Math.random() * 7200000).toISOString(),
                icon: 'Ticket'
              }))
            ).catch(error => {
              console.error('Error fetching recent tickets:', error);
              return [];
            }),
            userService.getBuyersOfMyEvents().then(users =>
              users.slice(0, 1).map(user => ({
                type: 'user',
                title: `Người dùng mới đã mua vé`,
                time: new Date(Date.now() - Math.random() * 1800000).toISOString(),
                icon: 'Users'
              }))
            ).catch(error => {
              console.error('Error fetching recent users:', error);
              return [];
            })
          ]).then(results => results.flat().sort((a, b) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          ))
        ]);

        console.log('Fetched data:', {
          eventsData,
          myTicketsStats,
          myBuyers,
          activities
        });

        // Tính toán thống kê từ dữ liệu
        const ticketStats = {
          total: myTicketsStats.totalSold,
          sold: myTicketsStats.totalSold,
          revenue: myTicketsStats.totalRevenue
        };

        const userStats = {
          total: myBuyers.length,
          growth: '+8%' // Có thể tính toán % tăng trưởng nếu có dữ liệu lịch sử
        };

        console.log('Calculated stats:', {
          ticketStats,
          userStats
        });

        setEventStats(eventsData);
        setTicketStats(ticketStats);
        setRecentEvents(await eventService.getMyEvents().catch(error => {
          console.error('Error fetching events for recent list:', error);
          return [];
        }));
        setUserStats(userStats);
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Chào mừng trở lại!</h1>
        <p className="text-gray-300">Đây là tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Events Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Calendar className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-sm text-gray-400">Sự kiện</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{eventStats?.total || 0}</h3>
              <p className="text-sm text-gray-400">Tổng số sự kiện</p>
            </div>
            <div className="flex items-center text-green-400">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+{eventStats?.upcoming || 0}</span>
            </div>
          </div>
        </div>

        {/* Tickets Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Ticket className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Vé</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{ticketStats?.total || 0}</h3>
              <p className="text-sm text-gray-400">Tổng số vé</p>
            </div>
            <div className="flex items-center text-green-400">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">+{ticketStats?.sold || 0}</span>
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-sm text-gray-400">Doanh thu</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketStats?.revenue || 0)}
              </h3>
              <p className="text-sm text-gray-400">Tổng doanh thu</p>
            </div>
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+12%</span>
            </div>
          </div>
        </div>

        {/* Users Stats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-pink-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-sm text-gray-400">Người dùng</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{userStats?.total || 0}</h3>
              <p className="text-sm text-gray-400">Tổng người dùng</p>
            </div>
            <div className="flex items-center text-green-400">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span className="text-sm">{userStats?.growth || '+0%'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Sự kiện gần đây</h2>
            <Link 
              href="/dashboard/events" 
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div 
                key={event.id}
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{event.eventName}</h3>
                      <p className="text-sm text-gray-400">{event.eventDetails?.[0]?.location || 'Chưa có địa điểm'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">
                      {new Date(event.eventDetails?.[0]?.startTime).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.eventDetails?.[0]?.startTime).toLocaleTimeString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Hoạt động gần đây</h2>
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 bg-white/5 rounded-xl p-4"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'event' ? 'bg-indigo-500/20' :
                  activity.type === 'ticket' ? 'bg-purple-500/20' :
                  'bg-pink-500/20'
                }`}>
                  {activity.type === 'event' && <Calendar className="w-5 h-5 text-indigo-400" />}
                  {activity.type === 'ticket' && <Ticket className="w-5 h-5 text-purple-400" />}
                  {activity.type === 'user' && <Users className="w-5 h-5 text-pink-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.time).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 