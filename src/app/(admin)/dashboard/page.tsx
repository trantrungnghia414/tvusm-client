"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/header/Header";
import OverviewContent from "./components/overview/OverviewContent";

// Interfaces for API responses
interface BookingStatsResponse {
    totalBookings?: number;
    todayBookings?: number;
    todayBookingsCreated?: number;
    pendingBookings?: number;
    totalRevenue?: number;
    monthlyRevenue?: number;
    completionRate?: number;
}

interface PaymentStatsResponse {
    totalPayments?: number;
    totalAmount?: number;
    pendingPayments?: number;
    pendingAmount?: number;
    completedPayments?: number;
    completedAmount?: number;
    failedPayments?: number;
    refundedAmount?: number;
    todayRevenue?: number;
    monthlyRevenue?: number;
    cashPayments?: number;
    onlinePayments?: number;
}

interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    name?: string;
    phone?: string;
    role: string;
    created_at: string;
}

interface BookingResponse {
    booking_id: number;
    user_id: number;
    court_id: number;
    date?: string;
    booking_date?: string;
    start_time: string;
    end_time: string;
    total_amount?: number;
    total_price?: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    payment_status?: "unpaid" | "partial" | "paid" | "refunded";
    notes?: string;
    created_at: string;
    updated_at: string;
    renter_name?: string;
    renter_phone?: string;
    renter_email?: string;
    user?: User;
    court?: {
        court_id: number;
        name: string;
        type_name?: string;
        court_type?: {
            name: string;
        };
    };
}

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

                const token = localStorage.getItem("token");
                if (!token) return;

                // Fetch all data in parallel
                const [
                    bookingStatsRes,
                    paymentStatsRes,
                    usersRes,
                    bookingsRes,
                ] = await Promise.all([
                    fetchApi("/bookings/stats", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/payments/stats", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/bookings?limit=10", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                // Process booking stats
                let bookingStats: BookingStatsResponse = {};
                if (bookingStatsRes.ok) {
                    bookingStats = await bookingStatsRes.json();
                }

                // Process payment stats
                let paymentStats: PaymentStatsResponse = {};
                if (paymentStatsRes.ok) {
                    paymentStats = await paymentStatsRes.json();
                }

                // Process users
                let users: User[] = [];
                if (usersRes.ok) {
                    users = await usersRes.json();
                }

                // Process recent bookings
                let bookings: BookingResponse[] = [];
                if (bookingsRes.ok) {
                    bookings = await bookingsRes.json();
                }

                // Set combined stats (basic stats only, detailed calculation in OverviewContent)
                setStats({
                    totalUsers: users.length || 0,
                    todayBookings: bookingStats.todayBookings || 0,
                    monthlyRevenue:
                        Math.round(
                            ((paymentStats.monthlyRevenue || 0) / 1000000) * 10
                        ) / 10, // Convert to millions
                    pendingRequests: 0, // Will be calculated in OverviewContent for maintenance requests
                });

                // Transform bookings data
                const transformedBookings: Booking[] = bookings
                    .slice(0, 10)
                    .map((booking) => {
                        const userName =
                            booking.user?.fullname ||
                            booking.user?.name ||
                            booking.user?.username ||
                            booking.renter_name ||
                            "Khách hàng";
                        const courtName =
                            booking.court?.name || `Sân ${booking.court_id}`;
                        const bookingDate =
                            booking.date ||
                            booking.booking_date ||
                            new Date(booking.created_at).toLocaleDateString(
                                "vi-VN"
                            );
                        const timeSlot = `${booking.start_time} - ${booking.end_time}`;

                        return {
                            id: `B-${booking.booking_id}`,
                            user: userName,
                            field: courtName,
                            time: `${timeSlot} • ${bookingDate}`,
                            status: booking.status,
                        };
                    });

                setRecentBookings(transformedBookings);
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
