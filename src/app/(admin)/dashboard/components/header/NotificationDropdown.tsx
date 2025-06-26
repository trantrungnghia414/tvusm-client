// client/src/app/(admin)/dashboard/components/header/NotificationDropdown.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// ✅ Định nghĩa interface cho notification data thay vì any
interface NotificationData {
    link?: string;
    booking_id?: number;
    booking_code?: string;
    court_name?: string;
    venue_name?: string;
    payment_id?: number;
    amount?: number;
    payment_method?: string;
    event_id?: number;
    event_title?: string;
    user_id?: number;
    username?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    category?: string;
    tags?: string[];
    [key: string]: string | number | boolean | string[] | undefined;
}

interface Notification {
    notification_id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: NotificationData; // ✅ Thay any bằng NotificationData
}

interface NotificationStats {
    total: number;
    unread: number;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // ✅ Fetch notifications với debug logging
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            console.log("🔔 Fetching notifications...");

            // Fetch notifications
            const notificationsResponse = await fetchApi(
                "/notifications?limit=10",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Fetch stats
            const statsResponse = await fetchApi("/notifications/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (notificationsResponse.ok && statsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                const statsData = await statsResponse.json();

                console.log("📊 Notifications data:", notificationsData);
                console.log("📈 Stats data:", statsData);

                setNotifications(notificationsData.notifications || []);
                setStats(statsData);
            } else {
                console.error("❌ Failed to fetch notifications");
                console.log(
                    "Response status:",
                    notificationsResponse.status,
                    statsResponse.status
                );
            }
        } catch (error) {
            console.error("❌ Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Load notifications on mount và định kỳ
    useEffect(() => {
        fetchNotifications();

        // Refresh mỗi 30 giây
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, []);

    // Mark notification as read
    const markAsRead = async (notificationId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/notifications/read", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notification_ids: [notificationId] }),
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif.notification_id === notificationId
                            ? { ...notif, is_read: true }
                            : notif
                    )
                );
                setStats((prev) => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                }));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/notifications/read-all", {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((notif) => ({ ...notif, is_read: true }))
                );
                setStats((prev) => ({ ...prev, unread: 0 }));
                toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            toast.error("Không thể đánh dấu tất cả thông báo");
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.is_read) {
            await markAsRead(notification.notification_id);
        }

        // ✅ Navigate based on notification data với type safety
        if (notification.data?.link) {
            router.push(notification.data.link);
        } else {
            // Default navigation based on notification type
            switch (notification.type) {
                case "booking":
                    if (notification.data?.booking_id) {
                        router.push(
                            `/dashboard/bookings/${notification.data.booking_id}`
                        );
                    } else {
                        router.push("/dashboard/bookings");
                    }
                    break;
                case "payment":
                    router.push("/dashboard/payments");
                    break;
                case "event":
                    if (notification.data?.event_id) {
                        router.push(
                            `/dashboard/events/${notification.data.event_id}`
                        );
                    } else {
                        router.push("/dashboard/events");
                    }
                    break;
                default:
                    router.push("/dashboard/notifications");
                    break;
            }
        }
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    // Get notification type icon and color
    const getNotificationStyle = (type: string) => {
        switch (type) {
            case "booking":
                return { icon: "📅", color: "text-blue-600" };
            case "payment":
                return { icon: "💳", color: "text-green-600" };
            case "event":
                return { icon: "🎉", color: "text-purple-600" };
            case "success":
                return { icon: "✅", color: "text-green-600" };
            case "warning":
                return { icon: "⚠️", color: "text-yellow-600" };
            case "error":
                return { icon: "❌", color: "text-red-600" };
            case "system":
                return { icon: "⚙️", color: "text-gray-600" };
            case "info":
                return { icon: "ℹ️", color: "text-blue-500" };
            default:
                return { icon: "🔔", color: "text-gray-600" };
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {stats.unread > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {stats.unread > 99 ? "99+" : stats.unread}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Thông báo</h3>
                        {stats.unread > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Đánh dấu tất cả
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats.unread} chưa đọc / {stats.total} tổng
                    </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            Không có thông báo nào
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const style = getNotificationStyle(
                                notification.type
                            );
                            return (
                                <div
                                    key={notification.notification_id}
                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                                        !notification.is_read
                                            ? "bg-blue-50"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <span className="text-lg">
                                                {style.icon}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4
                                                    className={`font-medium text-sm ${style.color} truncate`}
                                                >
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(
                                                    notification.created_at
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-3 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push("/dashboard/notifications")}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem tất cả thông báo
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
