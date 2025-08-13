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
import { 
    ActivityLogItem, 
    ActivityLogFilters, 
    ActivityLogStats 
} from "./types/activityTypes";
// import { fetchApi } from "@/lib/api";
import * as XLSX from "xlsx";

export default function ActivityLogPage() {
    const router = useRouter();

    // State management
    const [activities, setActivities] = useState<ActivityLogItem[]>([]);
    const [filteredActivities, setFilteredActivities] = useState<ActivityLogItem[]>([]);
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

            // Mock data - replace with actual API call
            const mockActivities: ActivityLogItem[] = [
                {
                    id: "1",
                    type: "booking",
                    action: "create",
                    description: "Tạo đặt sân mới cho sân bóng đá 1",
                    user: {
                        id: "u1",
                        name: "Nguyễn Văn An",
                        email: "an@example.com",
                        role: "customer",
                    },
                    target: {
                        id: "b1",
                        name: "Đặt sân #B001",
                        type: "booking",
                    },
                    metadata: {
                        venue: "Sân bóng đá 1",
                        time: "15:30 - 17:00",
                        amount: "200,000 VND",
                    },
                    ip_address: "192.168.1.1",
                    timestamp: new Date().toISOString(),
                    severity: "low",
                },
                {
                    id: "2",
                    type: "user",
                    action: "login",
                    description: "Đăng nhập vào hệ thống",
                    user: {
                        id: "u2",
                        name: "Admin User",
                        email: "admin@tvu.edu.vn",
                        role: "admin",
                    },
                    ip_address: "192.168.1.10",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    severity: "low",
                },
                {
                    id: "3",
                    type: "payment",
                    action: "create",
                    description: "Thanh toán đặt sân thành công",
                    user: {
                        id: "u1",
                        name: "Nguyễn Văn An",
                        email: "an@example.com",
                        role: "customer",
                    },
                    target: {
                        id: "p1",
                        name: "Thanh toán #P001",
                        type: "payment",
                    },
                    metadata: {
                        amount: "200,000 VND",
                        method: "VNPay",
                        booking_id: "B001",
                    },
                    ip_address: "192.168.1.1",
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    severity: "medium",
                },
                {
                    id: "4",
                    type: "system",
                    action: "update",
                    description: "Cập nhật cấu hình hệ thống",
                    user: {
                        id: "u2",
                        name: "Admin User",
                        email: "admin@tvu.edu.vn",
                        role: "admin",
                    },
                    metadata: {
                        setting: "booking_limit",
                        old_value: "5",
                        new_value: "10",
                    },
                    ip_address: "192.168.1.10",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    severity: "high",
                },
                // Add more mock data...
            ];

            setActivities(mockActivities);
            
            // Calculate stats
            const mockStats: ActivityLogStats = {
                total: mockActivities.length,
                today: mockActivities.filter(a => 
                    new Date(a.timestamp).toDateString() === new Date().toDateString()
                ).length,
                thisWeek: mockActivities.filter(a => 
                    new Date(a.timestamp) >= subDays(new Date(), 7)
                ).length,
                thisMonth: mockActivities.filter(a => 
                    new Date(a.timestamp) >= subDays(new Date(), 30)
                ).length,
                byType: mockActivities.reduce((acc, activity) => {
                    acc[activity.type] = (acc[activity.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                bySeverity: mockActivities.reduce((acc, activity) => {
                    acc[activity.severity] = (acc[activity.severity] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
            };
            
            setStats(mockStats);

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
            filtered = filtered.filter(activity => activity.type === filters.type);
        }

        // Filter by action
        if (filters.action) {
            filtered = filtered.filter(activity => activity.action === filters.action);
        }

        // Filter by severity
        if (filters.severity) {
            filtered = filtered.filter(activity => activity.severity === filters.severity);
        }

        // Filter by date range
        if (filters.dateRange) {
            filtered = filtered.filter(activity => {
                const activityDate = new Date(activity.timestamp);
                const fromDate = filters.dateRange!.from;
                const toDate = filters.dateRange!.to;
                return activityDate >= fromDate && activityDate <= toDate;
            });
        }

        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(activity =>
                activity.description.toLowerCase().includes(searchLower) ||
                activity.user.name.toLowerCase().includes(searchLower) ||
                (activity.target?.name.toLowerCase().includes(searchLower))
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
    const handleExport = async () => {
        try {
            toast.info("Đang xuất báo cáo...");

            const exportData = filteredActivities.map(activity => ({
                "Thời gian": new Date(activity.timestamp).toLocaleString("vi-VN"),
                "Loại": activity.type,
                "Hành động": activity.action,
                "Mô tả": activity.description,
                "Người dùng": activity.user.name,
                "Email": activity.user.email,
                "Vai trò": activity.user.role,
                "Đối tượng": activity.target?.name || "",
                "Mức độ": activity.severity,
                "IP Address": activity.ip_address || "",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Nhật ký hoạt động");
            
            const filename = `nhat-ky-hoat-dong_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);

            toast.success("Xuất báo cáo thành công");
        } catch (error) {
            console.error("Error exporting:", error);
            toast.error("Không thể xuất báo cáo");
        }
    };

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
                </div>

                {/* Stats */}
                <ActivityStats stats={stats} loading={loading} />

                {/* Filters */}
                <ActivityFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onRefresh={handleRefresh}
                    onExport={handleExport}
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