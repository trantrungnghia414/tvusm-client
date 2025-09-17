// file OverviewContent được sử dụng để hiển thị các thông tin tổng quan về hệ thống

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Calendar,
    CreditCard,
    ListChecks,
    // FileText,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import MetricCard from "@/app/(admin)/dashboard/components/metrics/MetricCard";
import BookingRow from "@/app/(admin)/dashboard/components/metrics/BookingRow";
// import ActivityItem from "@/app/(admin)/dashboard/components/metrics/ActivityItem";

interface OverviewContentProps {
    stats: {
        totalUsers: number;
        todayBookings: number;
        monthlyRevenue: number | string;
        pendingRequests: number;
    };
    recentBookings: Array<{
        id: string;
        user: string;
        field: string;
        time: string;
        status: "pending" | "confirmed" | "completed" | "cancelled";
    }>;
}

interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    created_at: string;
}

interface CourtUsageData {
    court: {
        court_id: number;
        name: string;
        code?: string;
        type_name?: string;
        venue_name?: string;
    };
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
    averageBookingDuration: number;
    actualStatus?: "available" | "booked" | "maintenance";
}

interface TopUser {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    bookingCount: number;
    totalRevenue: number;
    lastBookingDate?: string;
}

// Define interface for activity item
interface SimpleActivityItem {
    id: string;
    type: string;
    description: string;
    user: {
        name: string;
    };
    timestamp: string;
}

// Basic interfaces for API responses
interface ApiBooking {
    booking_id: number;
    court?: {
        name?: string;
    };
    user?: {
        fullname?: string;
        username?: string;
    };
    created_at: string;
}

interface ApiUser {
    user_id: number;
    fullname?: string;
    username: string;
    created_at: string;
}

interface ApiPayment {
    payment_id: number;
    amount?: number;
    user?: {
        fullname?: string;
        username?: string;
    };
    created_at: string;
}

export default function OverviewContent({
    stats,
    recentBookings,
}: OverviewContentProps) {
    const router = useRouter();
    const [courtUsageData, setCourtUsageData] = useState<CourtUsageData[]>([]);
    const [topUsers, setTopUsers] = useState<TopUser[]>([]);
    const [newUsers, setNewUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    // const [recentActivities, setRecentActivities] = useState<
    //     SimpleActivityItem[]
    // >([]);
    const [calculatedStats, setCalculatedStats] = useState<{
        totalUsers: number;
        todayBookings: number;
        monthlyRevenue: number | string;
        pendingMaintenanceRequests: number;
        usersPercentageChange: string;
        usersPercentageTrend: "up" | "down";
        bookingsPercentageChange: string;
        bookingsPercentageTrend: "up" | "down";
        revenuePercentageChange: string;
        revenuePercentageTrend: "up" | "down";
    }>({
        totalUsers: stats.totalUsers,
        todayBookings: stats.todayBookings,
        monthlyRevenue: stats.monthlyRevenue,
        pendingMaintenanceRequests: 0,
        usersPercentageChange: "+0%",
        usersPercentageTrend: "up" as "up" | "down",
        bookingsPercentageChange: "+0%",
        bookingsPercentageTrend: "up" as "up" | "down",
        revenuePercentageChange: "+0%",
        revenuePercentageTrend: "up" as "up" | "down",
    });

    // Helper function to calculate percentage change
    const calculatePercentageChange = (
        current: number,
        previous: number
    ): { change: string; trend: "up" | "down" } => {
        if (previous === 0) {
            if (current === 0) {
                return { change: "0%", trend: "up" };
            }
            return { change: "+100%", trend: "up" };
        }

        const percentChange = ((current - previous) / previous) * 100;
        const sign = percentChange >= 0 ? "+" : "";
        const trend = percentChange >= 0 ? "up" : "down";

        return {
            change: `${sign}${percentChange.toFixed(1)}%`,
            trend,
        };
    };

    // Fetch recent activities similar to activity log page
    const fetchRecentActivities = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Fetch real data from multiple endpoints
            const [bookingsRes, usersRes, paymentsRes] = await Promise.all([
                fetchApi("/bookings", {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ ok: false })),
                fetchApi("/users?limit=20", {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ ok: false })),
                fetchApi("/payments", {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ ok: false })),
            ]);

            const activities: SimpleActivityItem[] = [];

            // Process bookings to create activity logs
            if (bookingsRes.ok && "json" in bookingsRes) {
                const bookings = await (bookingsRes as Response).json();
                const bookingArray = Array.isArray(bookings)
                    ? bookings
                    : bookings.data || [];

                bookingArray.slice(0, 3).forEach((booking: ApiBooking) => {
                    activities.push({
                        id: `booking-${booking.booking_id}`,
                        type: "booking",
                        description: `Đặt sân ${booking.court?.name || "mới"}`,
                        user: {
                            name:
                                booking.user?.fullname ||
                                booking.user?.username ||
                                "Người dùng",
                        },
                        timestamp:
                            booking.created_at || new Date().toISOString(),
                    });
                });
            }

            // Process users to create activity logs
            if (usersRes.ok && "json" in usersRes) {
                const users = await (usersRes as Response).json();
                const userArray = Array.isArray(users)
                    ? users
                    : users.data || [];

                userArray.slice(0, 2).forEach((user: ApiUser) => {
                    activities.push({
                        id: `user-${user.user_id}`,
                        type: "user",
                        description: `Tài khoản mới: ${
                            user.fullname || user.username
                        }`,
                        user: {
                            name: "System",
                        },
                        timestamp: user.created_at || new Date().toISOString(),
                    });
                });
            }

            // Process payments to create activity logs
            if (paymentsRes.ok && "json" in paymentsRes) {
                const payments = await (paymentsRes as Response).json();
                const paymentArray = Array.isArray(payments)
                    ? payments
                    : payments.data || [];

                paymentArray.slice(0, 2).forEach((payment: ApiPayment) => {
                    activities.push({
                        id: `payment-${payment.payment_id}`,
                        type: "payment",
                        description: `Thanh toán thành công ${payment.amount?.toLocaleString()} VND`,
                        user: {
                            name:
                                payment.user?.fullname ||
                                payment.user?.username ||
                                "Người dùng",
                        },
                        timestamp:
                            payment.created_at || new Date().toISOString(),
                    });
                });
            }

            // Sort activities by timestamp (newest first) and take first 5
            activities.sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            );

            // setRecentActivities(activities.slice(0, 5));
        } catch (error) {
            console.error("Error fetching recent activities:", error);
        }
    };

    useEffect(() => {
        const fetchAdditionalData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                // Get dates for comparison
                const today = new Date().toISOString().split("T")[0];
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split("T")[0];

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const currentMonth = new Date();
                const previousMonth = new Date();
                previousMonth.setMonth(previousMonth.getMonth() - 1);

                // Calculate month start and end dates properly
                const currentMonthStart = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1
                ).padStart(2, "0")}-01`;
                const currentMonthEnd = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    0
                );
                const currentMonthEndStr = `${currentMonthEnd.getFullYear()}-${String(
                    currentMonthEnd.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    currentMonthEnd.getDate()
                ).padStart(2, "0")}`;

                const previousMonthStart = `${previousMonth.getFullYear()}-${String(
                    previousMonth.getMonth() + 1
                ).padStart(2, "0")}-01`;
                const previousMonthEnd = new Date(
                    previousMonth.getFullYear(),
                    previousMonth.getMonth() + 1,
                    0
                );
                const previousMonthEndStr = `${previousMonthEnd.getFullYear()}-${String(
                    previousMonthEnd.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    previousMonthEnd.getDate()
                ).padStart(2, "0")}`;

                // Fetch all required data
                const [
                    courtUsageRes,
                    courtsRes,
                    usersRes,
                    allBookingsRes,
                    paymentsRes,
                    currentMonthDashboardRes,
                    previousMonthDashboardRes,
                    equipmentIssuesRes,
                    venueMaintenanceRes,
                ] = await Promise.all([
                    fetchApi(`/reports/courts?period=all`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/courts", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users?limit=1000", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/bookings", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/payments", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi(
                        `/reports/dashboard?startDate=${currentMonthStart}&endDate=${currentMonthEndStr}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    ).catch(() => ({ ok: false })),
                    fetchApi(
                        `/reports/dashboard?startDate=${previousMonthStart}&endDate=${previousMonthEndStr}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    ).catch(() => ({ ok: false })),
                    fetchApi("/equipment-issues?status=pending", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi("/venues?maintenance=pending", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                ]);

                // Process court usage data for top 10 most used courts with actual status
                if (courtUsageRes.ok && courtsRes.ok) {
                    const usageData = await courtUsageRes.json();
                    const courtsData = await courtsRes.json();

                    if (
                        usageData &&
                        usageData.courtUsage &&
                        Array.isArray(usageData.courtUsage) &&
                        courtsData &&
                        Array.isArray(courtsData)
                    ) {
                        // Create a map of court_id to actual status
                        const courtStatusMap = new Map(
                            courtsData.map(
                                (court: {
                                    court_id: number;
                                    status:
                                        | "available"
                                        | "booked"
                                        | "maintenance";
                                }) => [court.court_id, court.status]
                            )
                        );

                        // Add actual status to usage data
                        const courtsWithStatus = usageData.courtUsage.map(
                            (court: CourtUsageData) => ({
                                ...court,
                                actualStatus:
                                    courtStatusMap.get(court.court.court_id) ||
                                    "available",
                            })
                        );

                        setCourtUsageData(getTopCourts(courtsWithStatus));
                    }
                }

                // Process all data and calculate stats
                let users: User[] = [];
                let allBookings: {
                    booking_id?: number;
                    created_at: string;
                    user_id?: number;
                    total_cost?: number;
                    status?: string;
                    [key: string]: unknown;
                }[] = [];
                let currentMonthRevenue = 0;
                let previousMonthRevenue = 0;
                let pendingMaintenanceCount = 0;

                // Get users data first
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    users = Array.isArray(usersData)
                        ? usersData
                        : usersData.data || usersData.users || [];

                    // Get 5 newest users from all time
                    const newestUsers = users
                        .filter((user) => user.created_at)
                        .sort(
                            (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                        )
                        .slice(0, 5);

                    setNewUsers(newestUsers);
                }

                // Get all bookings and calculate top users
                if (allBookingsRes.ok) {
                    allBookings = await allBookingsRes.json();

                    // Get completed payments to calculate actual revenue
                    let completedPayments: {
                        booking_id?: number;
                        user_id?: number;
                        amount?: number;
                        status?: string;
                        [key: string]: unknown;
                    }[] = [];

                    if (paymentsRes.ok && "json" in paymentsRes) {
                        const paymentsData = await (
                            paymentsRes as Response
                        ).json();
                        const paymentsArray = Array.isArray(paymentsData)
                            ? paymentsData
                            : paymentsData.data || [];

                        completedPayments = paymentsArray.filter(
                            (payment: {
                                booking_id?: number;
                                user_id?: number;
                                amount?: number;
                                status?: string;
                                [key: string]: unknown;
                            }) => payment.status === "completed"
                        );
                    }

                    // Create a map of booking payments for quick lookup
                    const bookingPaymentMap = new Map<number, number>();
                    completedPayments.forEach((payment) => {
                        if (payment.booking_id && payment.amount) {
                            // Ensure amount is a number
                            const amount =
                                typeof payment.amount === "string"
                                    ? parseFloat(payment.amount)
                                    : payment.amount;

                            if (!isNaN(amount)) {
                                bookingPaymentMap.set(
                                    payment.booking_id,
                                    amount
                                );
                            }
                        }
                    });

                    console.log(
                        "Debug - Completed Payments:",
                        completedPayments
                    );
                    console.log(
                        "Debug - Booking Payment Map:",
                        bookingPaymentMap
                    );

                    // Calculate booking statistics per user
                    const userBookingStats = new Map<
                        number,
                        {
                            bookingCount: number;
                            totalRevenue: number;
                            lastBookingDate?: string;
                        }
                    >();

                    allBookings.forEach((booking) => {
                        if (booking.user_id) {
                            const userId = booking.user_id;
                            const current = userBookingStats.get(userId) || {
                                bookingCount: 0,
                                totalRevenue: 0,
                            };

                            current.bookingCount += 1;

                            // Add revenue from this specific booking's payment
                            const bookingId = booking.booking_id;
                            if (bookingId && bookingPaymentMap.has(bookingId)) {
                                const paymentAmount =
                                    bookingPaymentMap.get(bookingId) || 0;
                                current.totalRevenue += paymentAmount;
                                console.log(
                                    `Debug - User ${userId}, Booking ${bookingId}, Adding ${paymentAmount}, New Total: ${current.totalRevenue}`
                                );
                            } else {
                                console.log(
                                    `Debug - User ${userId}, Booking ${bookingId}, No payment found`
                                );
                            }

                            if (booking.created_at) {
                                if (
                                    !current.lastBookingDate ||
                                    new Date(booking.created_at) >
                                        new Date(current.lastBookingDate)
                                ) {
                                    current.lastBookingDate =
                                        booking.created_at;
                                }
                            }

                            userBookingStats.set(userId, current);
                        }
                    });

                    console.log(
                        "Debug - User Booking Stats:",
                        userBookingStats
                    );

                    // Create top users list
                    const topUsersList: TopUser[] = users
                        .map((user) => {
                            const stats = userBookingStats.get(
                                user.user_id
                            ) || {
                                bookingCount: 0,
                                totalRevenue: 0,
                            };
                            return {
                                ...user,
                                bookingCount: stats.bookingCount,
                                totalRevenue: stats.totalRevenue,
                                lastBookingDate: stats.lastBookingDate,
                            };
                        })
                        .filter((user) => user.bookingCount > 0)
                        .sort((a, b) => b.bookingCount - a.bookingCount)
                        .slice(0, 5);

                    console.log("Debug - Final Top Users List:", topUsersList);
                    setTopUsers(topUsersList);
                }

                // Calculate current month revenue from dashboard API
                if (
                    currentMonthDashboardRes.ok &&
                    "json" in currentMonthDashboardRes
                ) {
                    const currentDashboard = await (
                        currentMonthDashboardRes as Response
                    ).json();
                    currentMonthRevenue = currentDashboard.revenue?.total || 0;
                }

                // Calculate previous month revenue from dashboard API
                if (
                    previousMonthDashboardRes.ok &&
                    "json" in previousMonthDashboardRes
                ) {
                    const previousDashboard = await (
                        previousMonthDashboardRes as Response
                    ).json();
                    previousMonthRevenue =
                        previousDashboard.revenue?.total || 0;
                }

                // Calculate pending maintenance requests
                let equipmentIssuesCount = 0;
                let venueMaintenanceCount = 0;

                if (equipmentIssuesRes.ok && "json" in equipmentIssuesRes) {
                    const equipmentIssues = await (
                        equipmentIssuesRes as Response
                    ).json();
                    equipmentIssuesCount = Array.isArray(equipmentIssues)
                        ? equipmentIssues.length
                        : 0;
                }

                if (venueMaintenanceRes.ok && "json" in venueMaintenanceRes) {
                    const venueMaintenance = await (
                        venueMaintenanceRes as Response
                    ).json();
                    venueMaintenanceCount = Array.isArray(venueMaintenance)
                        ? venueMaintenance.length
                        : 0;
                }

                pendingMaintenanceCount =
                    equipmentIssuesCount + venueMaintenanceCount;

                // Calculate comparisons
                // Users created in current month (from 1st to end of month)
                const currentMonthStartDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    1
                );
                const currentMonthEndDate = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    0
                );
                currentMonthEndDate.setHours(23, 59, 59, 999);

                const usersCreatedThisMonth = users.filter((user) => {
                    const userDate = new Date(user.created_at);
                    return (
                        userDate >= currentMonthStartDate &&
                        userDate <= currentMonthEndDate
                    );
                }).length;

                // Users created in previous month (from 1st to end of previous month)
                const previousMonthStartDate = new Date(
                    previousMonth.getFullYear(),
                    previousMonth.getMonth(),
                    1
                );
                const previousMonthEndDate = new Date(
                    previousMonth.getFullYear(),
                    previousMonth.getMonth() + 1,
                    0
                );
                previousMonthEndDate.setHours(23, 59, 59, 999);

                const usersCreatedLastMonth = users.filter((user) => {
                    const userDate = new Date(user.created_at);
                    return (
                        userDate >= previousMonthStartDate &&
                        userDate <= previousMonthEndDate
                    );
                }).length;

                const totalUsersToday = users.length;

                const todayBookingsCreated = allBookings.filter((booking) => {
                    const bookingCreatedDate = new Date(booking.created_at)
                        .toISOString()
                        .split("T")[0];
                    return bookingCreatedDate === today;
                }).length;

                const yesterdayBookingsCreated = allBookings.filter(
                    (booking) => {
                        const bookingCreatedDate = new Date(booking.created_at)
                            .toISOString()
                            .split("T")[0];
                        return bookingCreatedDate === yesterdayStr;
                    }
                ).length;

                // Calculate percentage changes
                const usersChange = calculatePercentageChange(
                    usersCreatedThisMonth,
                    usersCreatedLastMonth
                );
                const bookingsChange = calculatePercentageChange(
                    todayBookingsCreated,
                    yesterdayBookingsCreated
                );
                const revenueChange = calculatePercentageChange(
                    currentMonthRevenue,
                    previousMonthRevenue
                );

                setCalculatedStats({
                    totalUsers: totalUsersToday,
                    todayBookings: todayBookingsCreated,
                    monthlyRevenue: formatCurrency(currentMonthRevenue),
                    pendingMaintenanceRequests: pendingMaintenanceCount,
                    usersPercentageChange: usersChange.change,
                    usersPercentageTrend: usersChange.trend,
                    bookingsPercentageChange: bookingsChange.change,
                    bookingsPercentageTrend: bookingsChange.trend,
                    revenuePercentageChange: revenueChange.change,
                    revenuePercentageTrend: revenueChange.trend,
                });
            } catch (error) {
                console.error("Error fetching additional data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdditionalData();
        fetchRecentActivities();
    }, []);

    const getRoleDisplayName = (
        role: string
    ): "Sinh viên" | "Giảng viên" | "Khách" => {
        const roleMap: { [key: string]: "Sinh viên" | "Giảng viên" | "Khách" } =
            {
                admin: "Giảng viên",
                manager: "Giảng viên",
                staff: "Giảng viên",
                user: "Khách",
                customer: "Khách",
                student: "Sinh viên",
                teacher: "Giảng viên",
            };
        return roleMap[role] || "Khách";
    };

    // Helper function to get top 10 courts by usage
    const getTopCourts = (courtData: CourtUsageData[]): CourtUsageData[] => {
        return courtData
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 10);
    };

    const isNewUser = (createdAt: string) => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(createdAt) >= threeDaysAgo;
    };

    // Handle navigation to maintenance page
    const handleMaintenanceClick = () => {
        // Navigate to maintenance/equipment issues page
        router.push("/dashboard/maintenances");
    };

    // Handle navigation to bookings page
    const handleViewAllBookingsClick = () => {
        router.push("/dashboard/bookings");
    };

    // Handle navigation to booking detail page
    const handleBookingDetailClick = (bookingId: string) => {
        // Extract booking ID from format "B-123" -> "123"
        const id = bookingId.replace(/^B-/, "");
        router.push(`/dashboard/bookings/${id}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Tổng người dùng"
                    value={calculatedStats.totalUsers.toLocaleString()}
                    change={calculatedStats.usersPercentageChange}
                    trend={calculatedStats.usersPercentageTrend}
                    description="người dùng mới tháng này"
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    iconBg="bg-blue-100"
                />
                <MetricCard
                    title="Lượt đặt sân hôm nay"
                    value={calculatedStats.todayBookings}
                    change={calculatedStats.bookingsPercentageChange}
                    trend={calculatedStats.bookingsPercentageTrend}
                    description="so với hôm qua"
                    icon={<Calendar className="h-5 w-5 text-green-600" />}
                    iconBg="bg-green-100"
                />
                <MetricCard
                    title="Doanh thu tháng"
                    value={calculatedStats.monthlyRevenue}
                    change={calculatedStats.revenuePercentageChange}
                    trend={calculatedStats.revenuePercentageTrend}
                    description="so với tháng trước"
                    icon={<CreditCard className="h-5 w-5 text-purple-600" />}
                    iconBg="bg-purple-100"
                />
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={handleMaintenanceClick}
                >
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Yêu cầu chờ xử lý
                                </p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {calculatedStats.pendingMaintenanceRequests}
                                </h3>
                                <div className="flex items-center mt-1">
                                    <span className="text-xs text-blue-600 font-medium hover:underline">
                                        Nhấn vào đây để xem chi tiết
                                    </span>
                                </div>
                            </div>
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                                <ListChecks className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-base">
                                Đặt sân gần đây
                            </CardTitle>
                            <CardDescription>
                                10 lượt đặt sân mới nhất
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewAllBookingsClick}
                        >
                            Xem tất cả
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Người đặt</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Sân
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Thời gian
                                    </TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBookings.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        id={booking.id}
                                        user={booking.user}
                                        field={booking.field}
                                        time={booking.time}
                                        status={booking.status}
                                        onDetailClick={handleBookingDetailClick}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Tình trạng sân bãi
                        </CardTitle>
                        <CardDescription>
                            10 sân có số lượt đặt sân cao nhất (tính theo toàn
                            thời gian)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {courtUsageData.length > 0 ? (
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">
                                                Tên sân
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">
                                                Trạng thái
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">
                                                Số lượt đặt
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courtUsageData.map((court, index) => (
                                            <TableRow
                                                key={court.court.court_id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                                            {index + 1}
                                                        </div>
                                                        <span className="font-medium text-gray-900">
                                                            {court.court.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            court.actualStatus ===
                                                            "booked"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : court.actualStatus ===
                                                                  "maintenance"
                                                                ? "bg-orange-100 text-orange-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}
                                                    >
                                                        {court.actualStatus ===
                                                        "booked"
                                                            ? "Đang sử dụng"
                                                            : court.actualStatus ===
                                                              "maintenance"
                                                            ? "Bảo trì"
                                                            : "Có sẵn"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-semibold text-gray-900">
                                                        {court.bookingCount}
                                                    </span>
                                                    <span className="text-gray-500 text-sm ml-1">
                                                        lượt
                                                    </span>
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    Đang tải...
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center text-gray-500">
                                    Không có dữ liệu thống kê sân
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Top người dùng đặt sân
                        </CardTitle>
                        <CardDescription>
                            5 người dùng đặt sân nhiều nhất
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {topUsers.length > 0 ? (
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700 w-16">
                                                Hạng
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700">
                                                Người dùng
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center w-24">
                                                Số lượt đặt
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right w-32">
                                                Tổng doanh thu
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topUsers.map((user, index) => (
                                            <TableRow
                                                key={user.user_id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full text-sm font-bold shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-medium shadow-sm">
                                                            {(
                                                                user.fullname ||
                                                                user.username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-gray-900 text-sm truncate">
                                                                {user.fullname ||
                                                                    user.username}
                                                            </div>
                                                            <div className="text-xs text-gray-500 truncate">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="font-bold text-blue-600 text-lg">
                                                        {user.bookingCount}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        lượt
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="font-bold text-green-600 text-sm">
                                                        {user.totalRevenue &&
                                                        !isNaN(
                                                            user.totalRevenue
                                                        ) &&
                                                        user.totalRevenue > 0
                                                            ? formatCurrency(
                                                                  user.totalRevenue
                                                              )
                                                            : "0 ₫"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        VNĐ
                                                    </div>
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                    <p className="text-sm text-gray-500">
                                        Đang tải...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Chưa có dữ liệu đặt sân
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Người dùng mới
                        </CardTitle>
                        <CardDescription>5 người dùng mới nhất</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {newUsers.length > 0 ? (
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">
                                                Thông tin
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-center">
                                                Vai trò
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">
                                                Ngày tạo
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {newUsers.map((user) => (
                                            <TableRow
                                                key={user.user_id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-sm">
                                                            {(
                                                                user.fullname ||
                                                                user.username
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {user.fullname ||
                                                                    user.username}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            getRoleDisplayName(
                                                                user.role
                                                            ) === "Sinh viên"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : getRoleDisplayName(
                                                                      user.role
                                                                  ) ===
                                                                  "Giảng viên"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {getRoleDisplayName(
                                                            user.role
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="text-right">
                                                        {isNewUser(
                                                            user.created_at
                                                        ) ? (
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                                                    Mới
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-600 font-medium">
                                                                {new Date(
                                                                    user.created_at
                                                                ).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                    <p className="text-sm text-gray-500">
                                        Đang tải...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Không có người dùng mới
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Nhật ký hoạt động
                        </CardTitle>
                        <CardDescription>
                            Hoạt động gần đây của hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => {
                                    // Calculate relative time
                                    const getRelativeTime = (
                                        timestamp: string
                                    ) => {
                                        const now = new Date();
                                        const activityTime = new Date(
                                            timestamp
                                        );
                                        const diffInMs =
                                            now.getTime() -
                                            activityTime.getTime();
                                        const diffInMinutes = Math.floor(
                                            diffInMs / (1000 * 60)
                                        );
                                        const diffInHours = Math.floor(
                                            diffInMinutes / 60
                                        );
                                        const diffInDays = Math.floor(
                                            diffInHours / 24
                                        );

                                        if (diffInMinutes < 1) {
                                            return "Vừa xong";
                                        } else if (diffInMinutes < 60) {
                                            return `${diffInMinutes} phút trước`;
                                        } else if (diffInHours < 24) {
                                            return `${diffInHours} giờ trước`;
                                        } else if (diffInDays === 1) {
                                            return "Hôm qua";
                                        } else {
                                            return `${diffInDays} ngày trước`;
                                        }
                                    };

                                    // Map activity type to ActivityItem expected types
                                    const mapActivityType = (type: string) => {
                                        switch (type) {
                                            case "booking":
                                                return "booking";
                                            case "user":
                                                return "user";
                                            case "payment":
                                                return "payment";
                                            default:
                                                return "update";
                                        }
                                    };

                                    return (
                                        <ActivityItem
                                            key={activity.id}
                                            type={mapActivityType(
                                                activity.type
                                            )}
                                            message={activity.description}
                                            time={getRelativeTime(
                                                activity.timestamp
                                            )}
                                        />
                                    );
                                })
                            ) : loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-500">
                                            Đang tải hoạt động...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <p className="text-sm">
                                        Không có hoạt động nào
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    );
}
