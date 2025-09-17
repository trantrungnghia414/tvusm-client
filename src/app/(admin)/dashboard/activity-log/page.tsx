// trang nhật ký hoạt động
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subDays } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";
import ActivityStats from "./components/ActivityStats";
import ActivityFilters from "./components/ActivityFilters";
import ActivityList from "./components/ActivityList";
import ActivityActions from "./components/ActivityActions";
import {
    ActivityLogItem,
    ActivityLogFilters,
    ActivityLogStats,
} from "./types/activityTypes";
import { fetchApi } from "@/lib/api";

// Interfaces for API data
interface BookingData {
    booking_id: number;
    user?: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        role: string;
    };
    court?: {
        name: string;
        code?: string;
    };
    start_time: string;
    end_time: string;
    total_cost: number;
    status: string;
    created_at: string;
}

interface UserData {
    user_id: number;
    username: string;
    fullname?: string;
    email: string;
    role: string;
    created_at: string;
}

interface PaymentData {
    payment_id: number;
    user?: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        role: string;
    };
    amount: number;
    payment_method: string;
    status: string;
    booking_id: number;
    created_at: string;
}

interface EventData {
    event_id: number;
    title: string;
    start_date: string;
    end_date: string;
    status: string;
    max_participants: number;
    created_by: number;
    created_at: string;
}

interface NewsData {
    news_id: number;
    title: string;
    category?: {
        name: string;
    };
    status: string;
    views: number;
    created_by: number;
    created_at: string;
}

export default function ActivityLogPage() {
    const router = useRouter();

    // State management
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<
        ActivityLogItem[]
    >([]);
    const [stats, setStats] = useState<ActivityLogStats>({
        total: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byType: {},
        bySeverity: {},
    });

    const [filters, setFilters] = useState<ActivityLogFilters>({
        dateRange: {
            from: subDays(new Date(), 7),
            to: new Date(),
        },
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch activities data
    const fetchActivities = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Fetch real data from multiple endpoints to construct activity logs
            const [bookingsRes, usersRes, paymentsRes, eventsRes, newsRes] =
                await Promise.all([
                    fetchApi("/bookings", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi("/users?limit=100", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi("/payments", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi("/events", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                    fetchApi("/news", {
                        headers: { Authorization: `Bearer ${token}` },
                    }).catch(() => ({ ok: false })),
                ]);

            const realActivities: ActivityLogItem[] = [];
            let activityId = 1;

            // Process bookings to create activity logs
            if (bookingsRes.ok && "json" in bookingsRes) {
                const bookings = await (bookingsRes as Response).json();
                const bookingArray: BookingData[] = Array.isArray(bookings)
                    ? bookings
                    : bookings.data || [];

                bookingArray.slice(0, 20).forEach((booking: BookingData) => {
                    realActivities.push({
                        id: `booking-${activityId++}`,
                        type: "booking",
                        action: "create",
                        description: `Tạo đặt sân mới - ${
                            booking.court?.name || "Sân"
                        } ${booking.court?.code || ""}`,
                        user: {
                            id: booking.user?.user_id?.toString() || "unknown",
                            name:
                                booking.user?.fullname ||
                                booking.user?.username ||
                                "Người dùng",
                            email: booking.user?.email || "",
                            role: booking.user?.role || "customer",
                        },
                        target: {
                            id: booking.booking_id?.toString(),
                            name: `Đặt sân #${booking.booking_id}`,
                            type: "booking",
                        },
                        metadata: {
                            court_name: booking.court?.name || "",
                            start_time: booking.start_time || "",
                            end_time: booking.end_time || "",
                            total_cost: booking.total_cost || 0,
                            status: booking.status || "",
                        },
                        timestamp:
                            booking.created_at || new Date().toISOString(),
                        severity: "low",
                    });
                });
            }

            // Process users to create activity logs
            if (usersRes.ok && "json" in usersRes) {
                const users = await (usersRes as Response).json();
                const userArray: UserData[] = Array.isArray(users)
                    ? users
                    : users.data || [];

                userArray.slice(0, 10).forEach((user: UserData) => {
                    realActivities.push({
                        id: `user-${activityId++}`,
                        type: "user",
                        action: "create",
                        description: `Tài khoản mới được tạo - ${
                            user.fullname || user.username
                        }`,
                        user: {
                            id: user.user_id?.toString() || "system",
                            name: "System",
                            email: "system@tvu.edu.vn",
                            role: "system",
                        },
                        target: {
                            id: user.user_id?.toString(),
                            name: user.fullname || user.username,
                            type: "user",
                        },
                        metadata: {
                            role: user.role || "",
                            email: user.email || "",
                        },
                        timestamp: user.created_at || new Date().toISOString(),
                        severity: "low",
                    });
                });
            }

            // Process payments to create activity logs
            if (paymentsRes.ok && "json" in paymentsRes) {
                const payments = await (paymentsRes as Response).json();
                const paymentArray: PaymentData[] = Array.isArray(payments)
                    ? payments
                    : payments.data || [];

                paymentArray.slice(0, 15).forEach((payment: PaymentData) => {
                    realActivities.push({
                        id: `payment-${activityId++}`,
                        type: "payment",
                        action: "create",
                        description: `Thanh toán thành công - ${payment.amount?.toLocaleString(
                            "vi-VN"
                        )}₫`,
                        user: {
                            id: payment.user?.user_id?.toString() || "unknown",
                            name:
                                payment.user?.fullname ||
                                payment.user?.username ||
                                "Người dùng",
                            email: payment.user?.email || "",
                            role: payment.user?.role || "customer",
                        },
                        target: {
                            id: payment.payment_id?.toString(),
                            name: `Thanh toán #${payment.payment_id}`,
                            type: "payment",
                        },
                        metadata: {
                            amount: payment.amount || 0,
                            method: payment.payment_method || "",
                            status: payment.status || "",
                            booking_id: payment.booking_id || "",
                        },
                        timestamp:
                            payment.created_at || new Date().toISOString(),
                        severity: "medium",
                    });
                });
            }

            // Process events to create activity logs
            if (eventsRes.ok && "json" in eventsRes) {
                const events = await (eventsRes as Response).json();
                const eventArray: EventData[] = Array.isArray(events)
                    ? events
                    : events.data || [];

                eventArray.slice(0, 8).forEach((event: EventData) => {
                    realActivities.push({
                        id: `event-${activityId++}`,
                        type: "event",
                        action: "create",
                        description: `Tạo sự kiện mới - ${event.title}`,
                        user: {
                            id: event.created_by?.toString() || "admin",
                            name: "Admin",
                            email: "admin@tvu.edu.vn",
                            role: "admin",
                        },
                        target: {
                            id: event.event_id?.toString(),
                            name: event.title,
                            type: "event",
                        },
                        metadata: {
                            start_date: event.start_date || "",
                            end_date: event.end_date || "",
                            status: event.status || "",
                            max_participants: event.max_participants || 0,
                        },
                        timestamp: event.created_at || new Date().toISOString(),
                        severity: "medium",
                    });
                });
            }

            // Process news to create activity logs
            if (newsRes.ok && "json" in newsRes) {
                const news = await (newsRes as Response).json();
                const newsArray: NewsData[] = Array.isArray(news)
                    ? news
                    : news.data || [];

                newsArray.slice(0, 8).forEach((newsItem: NewsData) => {
                    realActivities.push({
                        id: `news-${activityId++}`,
                        type: "news",
                        action: "create",
                        description: `Đăng tin tức mới - ${newsItem.title}`,
                        user: {
                            id: newsItem.created_by?.toString() || "admin",
                            name: "Admin",
                            email: "admin@tvu.edu.vn",
                            role: "admin",
                        },
                        target: {
                            id: newsItem.news_id?.toString(),
                            name: newsItem.title,
                            type: "news",
                        },
                        metadata: {
                            category: newsItem.category?.name || "",
                            status: newsItem.status || "",
                            views: newsItem.views || 0,
                        },
                        timestamp:
                            newsItem.created_at || new Date().toISOString(),
                        severity: "low",
                    });
                });
            }

            // Sort activities by timestamp (newest first)
            realActivities.sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            );

            setActivities(realActivities);

            // Calculate stats
            const realStats: ActivityLogStats = {
                total: realActivities.length,
                today: realActivities.filter(
                    (a) =>
                        new Date(a.timestamp).toDateString() ===
                        new Date().toDateString()
                ).length,
                thisWeek: realActivities.filter(
                    (a) => new Date(a.timestamp) >= subDays(new Date(), 7)
                ).length,
                thisMonth: realActivities.filter(
                    (a) => new Date(a.timestamp) >= subDays(new Date(), 30)
                ).length,
                byType: realActivities.reduce((acc, activity) => {
                    acc[activity.type] = (acc[activity.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                bySeverity: realActivities.reduce((acc, activity) => {
                    acc[activity.severity] = (acc[activity.severity] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
            };

            setStats(realStats);
        } catch (error) {
            console.error("Error fetching activities:", error);
            toast.error("Không thể tải dữ liệu nhật ký hoạt động");
        }
    }, [router]);

    // Filter activities
    const filterActivities = useCallback(() => {
        let filtered = [...activities];

        // Filter by type
        if (filters.type) {
            filtered = filtered.filter(
                (activity) => activity.type === filters.type
            );
        }

        // Filter by action
        if (filters.action) {
            filtered = filtered.filter(
                (activity) => activity.action === filters.action
            );
        }

        // Filter by severity
        if (filters.severity) {
            filtered = filtered.filter(
                (activity) => activity.severity === filters.severity
            );
        }

        // Filter by date range, specific date, or custom date range
        if (filters.specificDate) {
            // Filter by specific date
            filtered = filtered.filter((activity) => {
                const activityDate = new Date(activity.timestamp);
                const targetDate = new Date(filters.specificDate!);

                // Compare dates (ignoring time)
                return (
                    activityDate.getFullYear() === targetDate.getFullYear() &&
                    activityDate.getMonth() === targetDate.getMonth() &&
                    activityDate.getDate() === targetDate.getDate()
                );
            });
        } else if (filters.customDateRange) {
            // Filter by custom date range
            filtered = filtered.filter((activity) => {
                const activityDate = new Date(activity.timestamp);
                const fromDate = new Date(filters.customDateRange!.from);
                const toDate = new Date(filters.customDateRange!.to);

                // Set time to start/end of day for proper comparison
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);

                return activityDate >= fromDate && activityDate <= toDate;
            });
        } else if (filters.dateRange) {
            // Filter by predefined date range
            filtered = filtered.filter((activity) => {
                const activityDate = new Date(activity.timestamp);
                const fromDate = new Date(filters.dateRange!.from);
                const toDate = new Date(filters.dateRange!.to);

                return activityDate >= fromDate && activityDate <= toDate;
            });
        }

        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
                (activity) =>
                    activity.description.toLowerCase().includes(searchLower) ||
                    activity.user.name.toLowerCase().includes(searchLower) ||
                    activity.target?.name.toLowerCase().includes(searchLower)
            );
        }

        setFilteredActivities(filtered);
        setTotalItems(filtered.length);
        setCurrentPage(1); // Reset to first page when filters change
    }, [activities, filters]);

    // Get paginated activities
    const getPaginatedActivities = useCallback(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredActivities.slice(startIndex, endIndex);
    }, [filteredActivities, currentPage, itemsPerPage]);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            await fetchActivities();
            setLoading(false);
        };

        fetchInitialData();
    }, [fetchActivities]);

    // Filter activities when filters change
    useEffect(() => {
        filterActivities();
    }, [filterActivities]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchActivities();
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle export
    // Export function moved to ActivityActions component

    return (
        <DashboardLayout activeTab="activity-log">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Nhật ký hoạt động
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Theo dõi và giám sát mọi hoạt động trong hệ thống
                        </p>
                    </div>
                    <ActivityActions
                        activities={filteredActivities}
                        onRefresh={handleRefresh}
                        loading={refreshing}
                    />
                </div>

                {/* Stats */}
                <ActivityStats stats={stats} loading={loading} />

                {/* Filters */}
                <ActivityFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onRefresh={handleRefresh}
                    loading={refreshing}
                />

                {/* Activity List */}
                <ActivityList
                    activities={getPaginatedActivities()}
                    loading={loading}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </DashboardLayout>
    );
}
