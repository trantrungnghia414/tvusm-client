"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
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
import { Users, Calendar, DollarSign } from "lucide-react";
import StatsCards from "./components/StatsCards";
import RevenueChart from "./components/RevenueChart";
import BookingChart from "./components/BookingChart";
import CustomerTable from "./components/CustomerTable";
import CourtUsageChart from "./components/CourtUsageChart";
import ReportActions from "./components/ReportActions";

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
    const [period, setPeriod] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isCustomDate, setIsCustomDate] = useState(false);

    // State for UI
    const [loading, setLoading] = useState(true);

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
                console.log("🔍 Frontend sending dates:", {
                    startDate,
                    endDate,
                });
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else if (!isCustomDate) {
                params.append("period", period);
            } else {
                // Không fetch nếu custom date nhưng chưa đủ ngày
                return;
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
            console.log("Dashboard API response:", data);
            console.log("Revenue data from API:", data.revenue);
            setDashboardStats(data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            toast.error("Không thể tải dữ liệu thống kê");
        }
    }, [period, isCustomDate, startDate, endDate]);

    // Fetch customer data
    const fetchCustomerData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams();
            if (isCustomDate && startDate && endDate) {
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else if (!isCustomDate) {
                params.append("period", period);
            } else {
                // Không fetch nếu custom date nhưng chưa đủ ngày
                return;
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
    }, [period, isCustomDate, startDate, endDate]);

    // Fetch court usage data
    const fetchCourtUsageData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const params = new URLSearchParams();
            if (isCustomDate && startDate && endDate) {
                params.append("startDate", startDate);
                params.append("endDate", endDate);
            } else if (!isCustomDate) {
                params.append("period", period);
            } else {
                // Không fetch nếu custom date nhưng chưa đủ ngày
                return;
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
    }, [period, isCustomDate, startDate, endDate]);

    // Manual fetch function cho custom date
    const handleManualFetch = async () => {
        if (isCustomDate && (!startDate || !endDate)) {
            toast.error("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc");
            return;
        }

        setLoading(true);
        await Promise.all([
            fetchDashboardStats(),
            fetchCustomerData(),
            fetchCourtUsageData(),
        ]);
        setLoading(false);
        toast.success("Đã cập nhật dữ liệu");
    };

    // Initial data fetch và khi period thay đổi (không bao gồm date changes)
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

        // Chỉ fetch khi period thay đổi (không phải custom date)
        if (!isCustomDate) {
            fetchAllData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]); // Chỉ period dependency

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

    // Handle date change (no auto fetch)
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
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setPeriod("all");
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
                    </div>
                    <ReportActions
                        dashboardStats={dashboardStats}
                        customerData={customerData}
                        courtUsageData={courtUsageData}
                        period={period}
                        startDate={startDate}
                        endDate={endDate}
                        isCustomDate={isCustomDate}
                    />
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Bộ lọc thời gian</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="-mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="">
                                <Label className="mb-2">Khoảng thời gian</Label>
                                <Select
                                    value={period}
                                    onValueChange={handlePeriodChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn khoảng thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">
                                            Hôm nay
                                        </SelectItem>
                                        <SelectItem value="yesterday">
                                            Hôm qua
                                        </SelectItem>
                                        <SelectItem value="this_week">
                                            Tuần này
                                        </SelectItem>
                                        <SelectItem value="last_week">
                                            Tuần trước
                                        </SelectItem>
                                        <SelectItem value="this_month">
                                            Tháng này
                                        </SelectItem>
                                        <SelectItem value="last_month">
                                            Tháng trước
                                        </SelectItem>
                                        <SelectItem value="this_year">
                                            Năm này
                                        </SelectItem>
                                        <SelectItem value="last_year">
                                            Năm trước
                                        </SelectItem>
                                        <SelectItem value="all">
                                            Tất cả thời gian
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Tùy chỉnh
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="mb-2">Từ ngày</Label>
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
                                <Label className="mb-2">Đến ngày</Label>
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

                            {/* Button Áp dụng cho custom date */}
                            <div className="flex items-center">
                                {isCustomDate && (
                                    <Button
                                        onClick={handleManualFetch}
                                        disabled={!startDate || !endDate}
                                        className="w-full"
                                    >
                                        Áp dụng
                                    </Button>
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
