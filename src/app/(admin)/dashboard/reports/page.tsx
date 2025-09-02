"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CalendarIcon,
    RefreshCw,
    Users,
    Calendar,
    DollarSign,
} from "lucide-react";
import StatsCards from "./components/StatsCards";
import RevenueChart from "./components/RevenueChart";
import BookingChart from "./components/BookingChart";
import CustomerTable from "./components/CustomerTable";
import CourtUsageChart from "./components/CourtUsageChart";

interface DashboardStats {
    period: string;
    revenue: {
        total: number;
        growth: number;
        target?: number;
        achievement?: number;
    };
    bookings: {
        total: number;
        growth: number;
        avgValue: number;
    };
    customers: {
        total: number;
        active: number;
        new: number;
        retention: number;
    };
    courts: {
        totalCourts: number;
        avgUtilization: number;
        topPerformer: string;
    };
    trends: {
        revenueChart: Array<{ date: string; revenue: number }>;
        bookingsChart: Array<{ date: string; bookings: number }>;
    };
}

interface CustomerData {
    customer: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        phone?: string;
    };
    bookingCount: number;
    totalSpent: number;
    lastBooking: string;
}

interface CourtUsageData {
    court: {
        court_id: number;
        name: string;
        code: string;
        type_name?: string;
        venue_name?: string;
    };
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
    averageBookingDuration: number;
}

export default function ReportsPage() {
    // State for data
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
        null
    );
    const [customerData, setCustomerData] = useState<CustomerData[]>([]);
    const [courtUsageData, setCourtUsageData] = useState<CourtUsageData[]>([]);

    // State for filters
    const [period, setPeriod] = useState("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isCustomDate, setIsCustomDate] = useState(false);

    // State for UI
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch dashboard stats
    const fetchDashboardStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                return;
            }

            const params = new URLSearchParams();
            if (isCustomDate && startDate && endDate) {
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else {
                params.append("period", period);
            }

            const response = await fetchApi(
                `/reports/dashboard?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Không thể tải dữ liệu thống kê");
            }

            const data = await response.json();
            setDashboardStats(data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            toast.error("Không thể tải dữ liệu thống kê");
        }
    }, [period, startDate, endDate, isCustomDate]);

    // Fetch customer data
    const fetchCustomerData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams();
            if (isCustomDate && startDate && endDate) {
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else {
                params.append("period", period);
            }
            params.append("limit", "10");

            const response = await fetchApi(
                `/reports/customers?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCustomerData(data.topCustomers || []);
            }
        } catch (error) {
            console.error("Error fetching customer data:", error);
        }
    }, [period, startDate, endDate, isCustomDate]);

    // Fetch court usage data
    const fetchCourtUsageData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams();
            if (isCustomDate && startDate && endDate) {
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else {
                params.append("period", period);
            }

            const response = await fetchApi(
                `/reports/courts?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCourtUsageData(data.courtUsage || []);
            }
        } catch (error) {
            console.error("Error fetching court usage data:", error);
        }
    }, [period, startDate, endDate, isCustomDate]);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([
                fetchDashboardStats(),
                fetchCustomerData(),
                fetchCourtUsageData(),
            ]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchDashboardStats, fetchCustomerData, fetchCourtUsageData]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchDashboardStats(),
            fetchCustomerData(),
            fetchCourtUsageData(),
        ]);
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Get period display text
    const getPeriodDisplayText = () => {
        if (isCustomDate && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days =
                Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1;
            return `${start.toLocaleDateString(
                "vi-VN"
            )} - ${end.toLocaleDateString("vi-VN")} (${days} ngày)`;
        }

        switch (period) {
            case "week":
                return "Tuần này";
            case "month":
                return "Tháng này";
            case "quarter":
                return "Quý này";
            case "year":
                return "Năm này";
            case "all":
                return "Toàn thời gian";
            default:
                return "Tháng này";
        }
    };

    // Handle period change
    const handlePeriodChange = (value: string) => {
        setPeriod(value);
        if (value !== "custom") {
            setIsCustomDate(false);
            setStartDate("");
            setEndDate("");
        } else {
            setIsCustomDate(true);
            // Không tự động set ngày khi chọn tùy chỉnh
            setStartDate("");
            setEndDate("");
        }
    };

    // Handle date change with auto fetch
    const handleDateChange = (type: "start" | "end", value: string) => {
        if (type === "start") {
            setStartDate(value);
            // Tự động điều chỉnh endDate nếu cần
            if (endDate && new Date(value) > new Date(endDate)) {
                setEndDate(value);
            }
        } else {
            setEndDate(value);
        }

        // Validate dates
        const start = new Date(type === "start" ? value : startDate);
        const end = new Date(type === "end" ? value : endDate);
        const today = new Date();

        // Reset time for comparison
        today.setHours(0, 0, 0, 0);

        // Validation checks
        if (start > today) {
            toast.error("Ngày bắt đầu không thể lớn hơn ngày hiện tại");
            return;
        }

        if (end > today) {
            toast.error("Ngày kết thúc không thể lớn hơn ngày hiện tại");
            return;
        }

        if (start > end) {
            toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
            return;
        }

        // Check if both dates are selected
        const finalStartDate = type === "start" ? value : startDate;
        const finalEndDate = type === "end" ? value : endDate;

        if (finalStartDate && finalEndDate) {
            const daysDiff = Math.ceil(
                (new Date(finalEndDate).getTime() -
                    new Date(finalStartDate).getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            if (daysDiff > 365) {
                toast.error("Khoảng thời gian tối đa là 1 năm (365 ngày)");
                return;
            }

            if (daysDiff < 0) {
                toast.error("Khoảng thời gian không hợp lệ");
                return;
            }

            // Auto fetch data after a short delay
            setTimeout(() => {
                fetchDashboardStats();
                fetchCustomerData();
                fetchCourtUsageData();
                toast.success(
                    `Đã cập nhật bộ lọc: ${new Date(
                        finalStartDate
                    ).toLocaleDateString("vi-VN")} - ${new Date(
                        finalEndDate
                    ).toLocaleDateString("vi-VN")}`
                );
            }, 300);
        }
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setPeriod("month");
        setIsCustomDate(false);
        setStartDate("");
        setEndDate("");
        toast.success("Đã reset bộ lọc về mặc định");
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="reports">
                <LoadingSpinner message="Đang tải báo cáo thống kê..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="reports">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Báo cáo thống kê
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Theo dõi và phân tích hiệu quả kinh doanh để tối ưu
                            hóa doanh thu
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                📊 Khoảng thời gian: {getPeriodDisplayText()}
                            </span>
                            {dashboardStats && (
                                <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    📈 Doanh thu:{" "}
                                    {formatCurrency(
                                        dashboardStats.revenue.total
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        Làm mới
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Bộ lọc thời gian
                                </CardTitle>
                                <CardDescription>
                                    Chọn khoảng thời gian để xem báo cáo thống
                                    kê
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-xs"
                            >
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Khoảng thời gian</Label>
                                <Select
                                    value={period}
                                    onValueChange={handlePeriodChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khoảng thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">
                                            Tuần này
                                        </SelectItem>
                                        <SelectItem value="month">
                                            Tháng này
                                        </SelectItem>
                                        <SelectItem value="quarter">
                                            Quý này
                                        </SelectItem>
                                        <SelectItem value="year">
                                            Năm này
                                        </SelectItem>
                                        <SelectItem value="all">
                                            Toàn thời gian
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Tùy chỉnh
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Từ ngày</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        handleDateChange(
                                            "start",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isCustomDate}
                                    className={
                                        !isCustomDate
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : !startDate && isCustomDate
                                            ? "border-orange-300"
                                            : ""
                                    }
                                />
                                {!isCustomDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Chọn &ldquo;Tùy chỉnh&rdquo; để sử dụng
                                    </p>
                                )}
                                {isCustomDate && !startDate && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        Vui lòng chọn ngày bắt đầu
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label>Đến ngày</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    min={startDate || undefined}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        handleDateChange("end", e.target.value)
                                    }
                                    disabled={!isCustomDate || !startDate}
                                    className={
                                        !isCustomDate
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : !startDate && isCustomDate
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : !endDate &&
                                              startDate &&
                                              isCustomDate
                                            ? "border-orange-300"
                                            : ""
                                    }
                                />
                                {!isCustomDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Chọn &ldquo;Tùy chỉnh&rdquo; để sử dụng
                                    </p>
                                )}
                                {isCustomDate && !startDate && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Vui lòng chọn ngày bắt đầu trước
                                    </p>
                                )}
                                {isCustomDate && !endDate && startDate && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        Vui lòng chọn ngày kết thúc
                                    </p>
                                )}
                                {isCustomDate && startDate && endDate && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {Math.ceil(
                                            (new Date(endDate).getTime() -
                                                new Date(startDate).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                        ) + 1}{" "}
                                        ngày
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                {dashboardStats && <StatsCards stats={dashboardStats} />}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    {dashboardStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Xu hướng doanh thu
                                </CardTitle>
                                <CardDescription>
                                    Biểu đồ doanh thu theo thời gian
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RevenueChart
                                    data={dashboardStats.trends.revenueChart}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* Booking Chart */}
                    {dashboardStats && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Xu hướng lượt đặt sân
                                </CardTitle>
                                <CardDescription>
                                    Biểu đồ số lượt đặt sân theo thời gian
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BookingChart
                                    data={dashboardStats.trends.bookingsChart}
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Court Usage Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê sử dụng sân</CardTitle>
                        <CardDescription>
                            Mức độ sử dụng và doanh thu của từng sân thể thao
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CourtUsageChart data={courtUsageData} />
                    </CardContent>
                </Card>

                {/* Customer Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Top khách hàng
                        </CardTitle>
                        <CardDescription>
                            Danh sách khách hàng có lượt đặt sân và chi tiêu cao
                            nhất
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CustomerTable customers={customerData} />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
