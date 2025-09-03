// file OverviewContent được sử dụng để hiển thị các thông tin tổng quan về hệ thống

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Calendar,
    CreditCard,
    ListChecks,
    Clock,
    // FileText,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    // TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import MetricCard from "@/app/(admin)/dashboard/components/metrics/MetricCard";
import BookingRow from "@/app/(admin)/dashboard/components/metrics/BookingRow";
import FieldStatusItem from "@/app/(admin)/dashboard/components/metrics/FieldStatusItem";
import TodayScheduleItem from "@/app/(admin)/dashboard/components/metrics/TodayScheduleItem";
import UserItem from "@/app/(admin)/dashboard/components/metrics/UserItem";
import ActivityItem from "@/app/(admin)/dashboard/components/metrics/ActivityItem";

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

interface Court {
    court_id: number;
    name: string;
    status: "available" | "booked" | "maintenance";
    type_name?: string;
}

interface TodayBooking {
    booking_id: number;
    start_time: string;
    end_time: string;
    user?: {
        fullname?: string;
        username: string;
    };
    renter_name?: string;
    court?: {
        name: string;
    };
    status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    created_at: string;
}

export default function OverviewContent({
    stats,
    recentBookings,
}: OverviewContentProps) {
    const router = useRouter();
    const [courts, setCourts] = useState<Court[]>([]);
    const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
    const [newUsers, setNewUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
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
                    courtsRes,
                    todayBookingsRes,
                    usersRes,
                    allBookingsRes,
                    currentMonthDashboardRes,
                    previousMonthDashboardRes,
                    equipmentIssuesRes,
                    venueMaintenanceRes,
                ] = await Promise.all([
                    fetchApi("/courts", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi(`/bookings?date=${today}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/bookings", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
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

                // Process courts data
                if (courtsRes.ok) {
                    const courtsData = await courtsRes.json();
                    setCourts(courtsData.slice(0, 5));
                }

                // Process today's bookings
                if (todayBookingsRes.ok) {
                    const bookingsData = await todayBookingsRes.json();
                    setTodayBookings(bookingsData.slice(0, 5));
                }

                // Process all data and calculate stats
                let users: User[] = [];
                let allBookings: {
                    created_at: string;
                    [key: string]: unknown;
                }[] = [];
                let currentMonthRevenue = 0;
                let previousMonthRevenue = 0;
                let pendingMaintenanceCount = 0;

                if (usersRes.ok) {
                    users = await usersRes.json();
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    const recentUsers = users
                        .filter(
                            (user) => new Date(user.created_at) >= sevenDaysAgo
                        )
                        .sort(
                            (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                        )
                        .slice(0, 5);

                    setNewUsers(recentUsers);
                }

                if (allBookingsRes.ok) {
                    allBookings = await allBookingsRes.json();
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
    }, []);

    const formatTime = (timeString: string) => {
        try {
            const time = new Date(`2000-01-01T${timeString}`);
            return time.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        } catch {
            return timeString;
        }
    };

    const getBookingStatus = (status: string, startTime: string) => {
        const now = new Date();
        const bookingTime = new Date(
            `${new Date().toDateString()} ${startTime}`
        );

        if (status === "completed") return "completed";
        if (status === "cancelled") return "completed";
        if (bookingTime <= now) return "ongoing";
        return "upcoming";
    };

    const getUserDisplayName = (
        user?: { fullname?: string; username: string },
        renterName?: string
    ) => {
        if (renterName) return renterName;
        if (user?.fullname) return user.fullname;
        if (user?.username) return user.username;
        return "Khách hàng";
    };

    const mapCourtStatus = (
        status: string
    ): "available" | "maintenance" | "in-use" | "closed" => {
        switch (status) {
            case "available":
                return "available";
            case "booked":
                return "in-use";
            case "maintenance":
                return "maintenance";
            default:
                return "closed";
        }
    };

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
                        <Button variant="outline" size="sm">
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
                            Cập nhật thời gian thực
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                        <div className="space-y-4">
                            {courts.length > 0 ? (
                                courts.map((court) => (
                                    <FieldStatusItem
                                        key={court.court_id}
                                        name={court.name}
                                        status={mapCourtStatus(court.status)}
                                        utilizationRate={
                                            court.status === "available"
                                                ? Math.floor(
                                                      Math.random() * 40
                                                  ) + 30
                                                : court.status === "booked"
                                                ? Math.floor(
                                                      Math.random() * 30
                                                  ) + 70
                                                : Math.floor(
                                                      Math.random() * 30
                                                  ) + 20
                                        }
                                    />
                                ))
                            ) : loading ? (
                                <div className="text-center text-gray-500">
                                    Đang tải...
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    Không có dữ liệu sân
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Lịch đặt sân hôm nay
                        </CardTitle>
                        <CardDescription>
                            {new Date().toLocaleDateString("vi-VN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todayBookings.length > 0 ? (
                                todayBookings.map((booking) => (
                                    <TodayScheduleItem
                                        key={booking.booking_id}
                                        time={`${formatTime(
                                            booking.start_time
                                        )} - ${formatTime(booking.end_time)}`}
                                        field={
                                            booking.court?.name ||
                                            `Sân ${booking.booking_id}`
                                        }
                                        user={getUserDisplayName(
                                            booking.user,
                                            booking.renter_name
                                        )}
                                        status={getBookingStatus(
                                            booking.status,
                                            booking.start_time
                                        )}
                                    />
                                ))
                            ) : loading ? (
                                <div className="text-center text-gray-500">
                                    Đang tải...
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    Không có lịch đặt sân hôm nay
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Xem lịch đầy đủ
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Người dùng mới
                        </CardTitle>
                        <CardDescription>7 ngày gần đây</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {newUsers.length > 0 ? (
                                newUsers.map((user) => (
                                    <UserItem
                                        key={user.user_id}
                                        name={user.fullname || user.username}
                                        email={user.email}
                                        role={getRoleDisplayName(user.role)}
                                        isNew={isNewUser(user.created_at)}
                                    />
                                ))
                            ) : loading ? (
                                <div className="text-center text-gray-500">
                                    Đang tải...
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    Không có người dùng mới
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Hoạt động hệ thống
                        </CardTitle>
                        <CardDescription>
                            Cập nhật và thông báo mới
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBookings
                                .slice(0, 5)
                                .map((booking, index) => {
                                    const activityTypes: (
                                        | "booking"
                                        | "payment"
                                        | "user"
                                        | "maintenance"
                                        | "update"
                                    )[] = [
                                        "booking",
                                        "payment",
                                        "user",
                                        "maintenance",
                                        "update",
                                    ];
                                    const messages = [
                                        `${booking.user} đã đặt ${booking.field}`,
                                        `Thanh toán thành công cho ${booking.id}`,
                                        `Tài khoản mới: ${booking.user}`,
                                        `Bảo trì ${booking.field} hoàn thành`,
                                        `Cập nhật giá thuê ${booking.field}`,
                                    ];
                                    const times = [
                                        "15 phút trước",
                                        "2 giờ trước",
                                        "5 giờ trước",
                                        "Hôm qua",
                                        "2 ngày trước",
                                    ];

                                    return (
                                        <ActivityItem
                                            key={`activity-${booking.id}-${index}`}
                                            type={
                                                activityTypes[
                                                    index % activityTypes.length
                                                ]
                                            }
                                            message={
                                                messages[
                                                    index % messages.length
                                                ]
                                            }
                                            time={times[index % times.length]}
                                        />
                                    );
                                })}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                        <Button variant="outline" size="sm" className="w-full">
                            <Clock className="mr-2 h-4 w-4" />
                            Xem tất cả hoạt động
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
