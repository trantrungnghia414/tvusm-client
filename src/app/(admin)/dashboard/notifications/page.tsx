// client/src/app/(admin)/dashboard/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    Filter,
    Search,
    Check,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Notification, NotificationStats } from "@/app/(admin)/dashboard/notifications/types/notification";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            const response = await fetchApi("/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
                setStats(data.stats || { total: 0, unread: 0 });
            } else {
                throw new Error("Failed to fetch notifications");
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            toast.error("Không thể tải danh sách thông báo");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Filter notifications
    const filterNotifications = useCallback(() => {
        let result = [...notifications];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(notif =>
                notif.title.toLowerCase().includes(searchLower) ||
                notif.message.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter(notif => notif.type === typeFilter);
        }

        // Status filter
        if (statusFilter === "read") {
            result = result.filter(notif => notif.is_read);
        } else if (statusFilter === "unread") {
            result = result.filter(notif => !notif.is_read);
        }

        setFilteredNotifications(result);
    }, [notifications, searchTerm, typeFilter, statusFilter]);

    // Mark as read
    const markAsRead = async (notificationIds: number[]) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/notifications/mark-read", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notification_ids: notificationIds }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notificationIds.includes(notif.notification_id)
                            ? { ...notif, is_read: true }
                            : notif
                    )
                );
                setStats(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - notificationIds.length)
                }));
                toast.success("Đã đánh dấu thông báo là đã đọc");
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            toast.error("Không thể đánh dấu thông báo");
        }
    };

    // Delete notifications
    const deleteNotifications = async (notificationIds: number[]) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/notifications", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notification_ids: notificationIds }),
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.filter(notif =>
                        !notificationIds.includes(notif.notification_id)
                    )
                );
                setSelectedIds([]);
                toast.success("Đã xóa thông báo");
            }
        } catch (error) {
            console.error("Error deleting notifications:", error);
            toast.error("Không thể xóa thông báo");
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead([notification.notification_id]);
        }

        // Navigate based on notification data
        if (notification.data?.link) {
            router.push(notification.data.link);
        }
    };

    // Get notification icon
    const getNotificationIcon = (type: Notification['type']) => {
        const iconClass = "h-5 w-5";
        switch (type) {
            case 'booking':
                return <Calendar className={`${iconClass} text-blue-600`} />;
            case 'payment':
                return <CreditCard className={`${iconClass} text-green-600`} />;
            case 'success':
                return <CheckCircle className={`${iconClass} text-green-600`} />;
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-yellow-600`} />;
            case 'error':
                return <XCircle className={`${iconClass} text-red-600`} />;
            case 'system':
                return <Settings className={`${iconClass} text-gray-600`} />;
            default:
                return <Info className={`${iconClass} text-blue-600`} />;
        }
    };

    // Selection handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredNotifications.map(n => n.notification_id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectNotification = (notificationId: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, notificationId]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== notificationId));
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        filterNotifications();
    }, [filterNotifications]);

    const isAllSelected = filteredNotifications.length > 0 && 
        selectedIds.length === filteredNotifications.length;
    const isPartiallySelected = selectedIds.length > 0 && 
        selectedIds.length < filteredNotifications.length;

    return (
        <DashboardLayout activeTab="notifications">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Thông báo
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý thông báo và cập nhật hệ thống
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {stats.unread > 0 && (
                            <Badge variant="destructive">
                                {stats.unread} chưa đọc
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Bell className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                    <p className="text-sm text-gray-600">Tổng thông báo</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.unread}</p>
                                    <p className="text-sm text-gray-600">Chưa đọc</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold">{stats.total - stats.unread}</p>
                                    <p className="text-sm text-gray-600">Đã đọc</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-64">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Tìm kiếm thông báo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Loại thông báo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    <SelectItem value="booking">Đặt sân</SelectItem>
                                    <SelectItem value="payment">Thanh toán</SelectItem>
                                    <SelectItem value="system">Hệ thống</SelectItem>
                                    <SelectItem value="info">Thông tin</SelectItem>
                                    <SelectItem value="success">Thành công</SelectItem>
                                    <SelectItem value="warning">Cảnh báo</SelectItem>
                                    <SelectItem value="error">Lỗi</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="unread">Chưa đọc</SelectItem>
                                    <SelectItem value="read">Đã đọc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Đã chọn {selectedIds.length} thông báo
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markAsRead(selectedIds)}
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Đánh dấu đã đọc
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteNotifications(selectedIds)}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Notifications List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                Danh sách thông báo ({filteredNotifications.length})
                            </CardTitle>
                            {filteredNotifications.length > 0 && (
                                <Checkbox
                                    checked={isAllSelected}
                                    data-indeterminate={isPartiallySelected}
                                    onCheckedChange={handleSelectAll}
                                />
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <LoadingSpinner message="Đang tải thông báo..." />
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Không có thông báo
                                </h3>
                                <p className="text-gray-600">
                                    Không tìm thấy thông báo nào phù hợp với bộ lọc
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.notification_id}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                            !notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <Checkbox
                                                checked={selectedIds.includes(notification.notification_id)}
                                                onCheckedChange={(checked) =>
                                                    handleSelectNotification(
                                                        notification.notification_id,
                                                        checked as boolean
                                                    )
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatDistanceToNow(
                                                                new Date(notification.created_at),
                                                                { addSuffix: true, locale: vi }
                                                            )}
                                                        </span>
                                                        {!notification.is_read && (
                                                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <Badge variant="outline" className="text-xs">
                                                    {notification.type === 'booking' && 'Đặt sân'}
                                                    {notification.type === 'payment' && 'Thanh toán'}
                                                    {notification.type === 'system' && 'Hệ thống'}
                                                    {notification.type === 'info' && 'Thông tin'}
                                                    {notification.type === 'success' && 'Thành công'}
                                                    {notification.type === 'warning' && 'Cảnh báo'}
                                                    {notification.type === 'error' && 'Lỗi'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}