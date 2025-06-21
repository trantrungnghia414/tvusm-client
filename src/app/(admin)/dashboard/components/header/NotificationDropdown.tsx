// client/src/app/(admin)/dashboard/components/header/NotificationDropdown.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Bell,
    Calendar,
    CreditCard,
    Info,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Settings,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { fetchApi } from "@/lib/api";
import { Notification, NotificationStats } from "@/app/(admin)/dashboard/notifications/types/notification";

export default function NotificationDropdown() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({
        total: 0,
        unread: 0,
    });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setStats(data.stats || { total: 0, unread: 0 });
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi(
                `/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

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

        // Navigate based on notification type and data
        if (notification.data?.link) {
            router.push(notification.data.link);
            setOpen(false);
        } else if (
            notification.type === "booking" &&
            notification.data?.booking_id
        ) {
            router.push(`/dashboard/bookings/${notification.data.booking_id}`);
            setOpen(false);
        } else if (
            notification.type === "payment" &&
            notification.data?.payment_id
        ) {
            router.push(`/dashboard/payments/${notification.data.payment_id}`);
            setOpen(false);
        }
    };

    // Get icon for notification type
    const getNotificationIcon = (type: Notification["type"]) => {
        const iconClass = "h-4 w-4";
        switch (type) {
            case "booking":
                return <Calendar className={`${iconClass} text-blue-600`} />;
            case "payment":
                return <CreditCard className={`${iconClass} text-green-600`} />;
            case "success":
                return (
                    <CheckCircle className={`${iconClass} text-green-600`} />
                );
            case "warning":
                return (
                    <AlertTriangle className={`${iconClass} text-yellow-600`} />
                );
            case "error":
                return <XCircle className={`${iconClass} text-red-600`} />;
            case "system":
                return <Settings className={`${iconClass} text-gray-600`} />;
            default:
                return <Info className={`${iconClass} text-blue-600`} />;
        }
    };

    // Get notification color based on type
    const getNotificationColor = (type: Notification["type"]) => {
        switch (type) {
            case "booking":
                return "border-l-blue-500 bg-blue-50";
            case "payment":
                return "border-l-green-500 bg-green-50";
            case "success":
                return "border-l-green-500 bg-green-50";
            case "warning":
                return "border-l-yellow-500 bg-yellow-50";
            case "error":
                return "border-l-red-500 bg-red-50";
            case "system":
                return "border-l-gray-500 bg-gray-50";
            default:
                return "border-l-blue-500 bg-blue-50";
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Auto refresh notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {stats.unread > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {stats.unread > 99 ? "99+" : stats.unread}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Thông báo</span>
                    {stats.unread > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-6 px-2 text-xs"
                        >
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            Không có thông báo nào
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-96">
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.notification_id}
                                    className="p-0"
                                    onSelect={() =>
                                        handleNotificationClick(notification)
                                    }
                                >
                                    <div
                                        className={`
                                            w-full p-3 border-l-4 cursor-pointer transition-colors
                                            ${getNotificationColor(
                                                notification.type
                                            )}
                                            ${
                                                !notification.is_read
                                                    ? "bg-opacity-100"
                                                    : "bg-opacity-50"
                                            }
                                            hover:bg-opacity-75
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(
                                                    notification.type
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.created_at
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                            locale: vi,
                                                        }
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={() => {
                        router.push("/dashboard/notifications");
                        setOpen(false);
                    }}
                    className="justify-center"
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem tất cả thông báo
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
