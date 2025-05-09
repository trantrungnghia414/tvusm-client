//file này dung để hiển thị các thông tin của người dùng trong bảng thống kê người dùng

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import OverviewContent from "./components/overview/OverviewContent";

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        todayBookings: 0,
        monthlyRevenue: 0,
        pendingRequests: 0,
    });
    interface Booking {
        id: string;
        user: string;
        field: string;
        time: string;
        status: "completed" | "pending" | "cancelled" | "confirmed";
    }
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra xác thực và vai trò
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để tiếp tục");
            router.push("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Lấy thống kê tổng quan
                const statsResponse = await fetchApi("/dashboard/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!statsResponse.ok) {
                    throw new Error("Không thể lấy dữ liệu thống kê");
                }

                const statsData = await statsResponse.json();
                setStats({
                    totalUsers: statsData.totalUsers || 0,
                    todayBookings: statsData.todayBookings || 0,
                    monthlyRevenue: statsData.monthlyRevenue || 0,
                    pendingRequests: statsData.pendingRequests || 0,
                });

                // Lấy danh sách đặt sân gần đây
                const bookingsResponse = await fetchApi("/bookings/recent", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!bookingsResponse.ok) {
                    throw new Error("Không thể lấy dữ liệu đặt sân");
                }

                const bookingsData = await bookingsResponse.json();

                // Chuyển đổi dữ liệu từ API sang định dạng cần thiết cho component
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formattedBookings = bookingsData.map((booking: any) => ({
                    id: booking.booking_id.toString(),
                    user:
                        booking.user?.fullname ||
                        booking.user?.username ||
                        "Không xác định",
                    field:
                        booking.sub_arena?.name ||
                        booking.arena?.name ||
                        "Không xác định",
                    time: `${booking.start_time.slice(
                        0,
                        5
                    )} - ${booking.end_time.slice(0, 5)} • ${new Date(
                        booking.date
                    ).toLocaleDateString("vi-VN")}`,
                    status: booking.status,
                }));

                setRecentBookings(formattedBookings);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Không thể tải dữ liệu dashboard");

                // Sử dụng dữ liệu mẫu trong trường hợp API thất bại
                setStats({
                    totalUsers: 125,
                    todayBookings: 32,
                    monthlyRevenue: 78.5,
                    pendingRequests: 12,
                });

                setRecentBookings([
                    {
                        id: "1",
                        user: "Nguyễn Văn A",
                        field: "Sân số 1",
                        time: "09:00 - 10:30",
                        status: "completed",
                    },
                    {
                        id: "2",
                        user: "Trần Thị B",
                        field: "Sân số 3",
                        time: "14:00 - 15:30",
                        status: "pending",
                    },
                    {
                        id: "3",
                        user: "Lê Văn C",
                        field: "Sân số 2",
                        time: "16:00 - 17:30",
                        status: "cancelled",
                    },
                    {
                        id: "4",
                        user: "Phạm Thị D",
                        field: "Sân số 4",
                        time: "19:00 - 20:30",
                        status: "confirmed",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                mobileMenuOpen={mobileMenuOpen}
            />

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500">
                                    Đang tải dữ liệu...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <OverviewContent
                            stats={stats}
                            recentBookings={recentBookings}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
