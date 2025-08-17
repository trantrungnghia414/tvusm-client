"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { fetchApi } from "@/lib/api";

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
        status: "pending" | "confirmed" | "completed" | "cancelled";
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

                // Giả lập dữ liệu từ API (sẽ thay thế bằng API thực tế sau)
                // const response = await fetchApi("/admin/dashboard-stats", {
                //     headers: { Authorization: `Bearer ${token}` }
                // });

                // Mô phỏng dữ liệu thống kê
                setStats({
                    totalUsers: 125,
                    todayBookings: 32,
                    monthlyRevenue: 78.5,
                    pendingRequests: 12,
                });

                // Mô phỏng dữ liệu đặt sân
                setRecentBookings([
                    {
                        id: "B-2023",
                        user: "Nguyễn Văn An",
                        field: "Sân bóng đá 1",
                        time: "15:30 - 17:00 • 22/05/2025",
                        status: "pending",
                    },
                    {
                        id: "B-2022",
                        user: "Trần Thị Bình",
                        field: "Sân cầu lông A",
                        time: "08:00 - 09:30 • 22/05/2025",
                        status: "completed",
                    },
                    {
                        id: "B-2021",
                        user: "Lê Văn Cường",
                        field: "Sân bóng rổ",
                        time: "18:30 - 20:00 • 21/05/2025",
                        status: "completed",
                    },
                    {
                        id: "B-2020",
                        user: "Phạm Thị Diệp",
                        field: "Sân bóng đá 2",
                        time: "16:00 - 18:00 • 21/05/2025",
                        status: "cancelled",
                    },
                    {
                        id: "B-2019",
                        user: "Hoàng Văn Em",
                        field: "Sân cầu lông B",
                        time: "10:30 - 12:00 • 21/05/2025",
                        status: "confirmed",
                    },
                ]);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Không thể tải dữ liệu dashboard");
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
