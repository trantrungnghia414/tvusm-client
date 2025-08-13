// trang quản lý báo cáo
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ReportFilters from "./components/ReportFilters";
import OverviewReport from "./components/OverviewReport";
import ReportChart from "./components/ReportChart";
import {
    ReportFilters as FilterType,
    OverviewStats,
    BookingStats,
    RevenueStats,
    UserStats,
    VenueStats,
    ExportOptions,
} from "./types/reportTypes";
import { fetchApi } from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

// ✅ Sửa lỗi: Định nghĩa interface cho venue data
interface VenueData {
    venue_id: number;
    name: string;
}

export default function ReportsPage() {
    const router = useRouter();

    // Filter state
    const [filters, setFilters] = useState<FilterType>({
        dateRange: {
            from: subDays(new Date(), 30),
            to: new Date(),
        },
        reportType: "overview",
        period: "daily",
    });

    // Data states
    const [overviewStats, setOverviewStats] = useState<OverviewStats>({
        totalBookings: 0,
        totalRevenue: 0,
        totalUsers: 0,
        totalVenues: 0,
        averageRating: 0,
        completionRate: 0,
        cancellationRate: 0,
        topVenue: { name: "", bookings: 0 },
    });

    const [bookingStats, setBookingStats] = useState<BookingStats>({
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        peakHours: [],
        dailyBookings: [],
    });

    const [revenueStats, setRevenueStats] = useState<RevenueStats>({
        totalRevenue: 0,
        dailyRevenue: [],
        monthlyRevenue: [],
        revenueByVenue: [],
        paymentMethods: [],
    });

    const [userStats, setUserStats] = useState<UserStats>({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        userGrowth: [],
        usersByRole: [],
        topUsers: [],
    });

    const [venueStats, setVenueStats] = useState<VenueStats>({
        totalVenues: 0,
        activeVenues: 0,
        venueUtilization: [],
        courtUtilization: [],
    });

    const [venues, setVenues] = useState<VenueData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch venues for filter
    const fetchVenues = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/venues", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                // ✅ Sửa lỗi: Thay thế 'any' bằng VenueData
                setVenues(data.map((venue: VenueData) => ({
                    venue_id: venue.venue_id,
                    name: venue.name,
                })));
            }
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, []);

    // Fetch report data based on filters
    const fetchReportData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Mock data - replace with actual API calls
            switch (filters.reportType) {
                case "overview":
                    // Mock overview data
                    setOverviewStats({
                        totalBookings: 1250,
                        totalRevenue: 125000000,
                        totalUsers: 485,
                        totalVenues: 8,
                        averageRating: 4.6,
                        completionRate: 92.5,
                        cancellationRate: 7.5,
                        topVenue: { name: "Sân bóng đá TVU", bookings: 340 },
                    });
                    break;

                case "bookings":
                    setBookingStats({
                        totalBookings: 1250,
                        confirmedBookings: 980,
                        pendingBookings: 95,
                        cancelledBookings: 94,
                        completedBookings: 1156,
                        peakHours: [
                            { hour: "6:00", count: 45 },
                            { hour: "8:00", count: 89 },
                            { hour: "10:00", count: 156 },
                            { hour: "14:00", count: 134 },
                            { hour: "16:00", count: 198 },
                            { hour: "18:00", count: 234 },
                            { hour: "20:00", count: 167 },
                        ],
                        dailyBookings: Array.from({ length: 30 }, (_, i) => ({
                            date: format(subDays(new Date(), 29 - i), "dd/MM"),
                            count: Math.floor(Math.random() * 50) + 20,
                        })),
                    });
                    break;

                case "revenue":
                    setRevenueStats({
                        totalRevenue: 125000000,
                        dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
                            date: format(subDays(new Date(), 29 - i), "dd/MM"),
                            amount: Math.floor(Math.random() * 5000000) + 2000000,
                        })),
                        monthlyRevenue: [
                            { month: "Jan", amount: 45000000 },
                            { month: "Feb", amount: 52000000 },
                            { month: "Mar", amount: 48000000 },
                            { month: "Apr", amount: 61000000 },
                            { month: "May", amount: 55000000 },
                            { month: "Jun", amount: 67000000 },
                        ],
                        revenueByVenue: [
                            { venueName: "Sân bóng đá TVU", amount: 35000000 },
                            { venueName: "Sân cầu lông A", amount: 28000000 },
                            { venueName: "Sân bóng rổ", amount: 22000000 },
                            { venueName: "Sân tennis", amount: 18000000 },
                            { venueName: "Sân bóng chuyền", amount: 15000000 },
                        ],
                        paymentMethods: [
                            { method: "Tiền mặt", amount: 45000000, count: 450 },
                            { method: "Chuyển khoản", amount: 58000000, count: 520 },
                            { method: "Ví điện tử", amount: 22000000, count: 280 },
                        ],
                    });
                    break;

                case "users":
                    setUserStats({
                        totalUsers: 485,
                        activeUsers: 342,
                        newUsers: 67,
                        userGrowth: Array.from({ length: 12 }, (_, i) => ({
                            date: format(subDays(new Date(), (11 - i) * 30), "MM/yyyy"),
                            count: Math.floor(Math.random() * 50) + 30,
                        })),
                        usersByRole: [
                            { role: "Sinh viên", count: 285 },
                            { role: "Giảng viên", count: 89 },
                            { role: "Khách", count: 111 },
                        ],
                        topUsers: [
                            { name: "Nguyễn Văn A", bookings: 45, revenue: 4500000 },
                            { name: "Trần Thị B", bookings: 38, revenue: 3800000 },
                            { name: "Lê Văn C", bookings: 32, revenue: 3200000 },
                            { name: "Phạm Thị D", bookings: 28, revenue: 2800000 },
                            { name: "Hoàng Văn E", bookings: 25, revenue: 2500000 },
                        ],
                    });
                    break;

                case "venues":
                    setVenueStats({
                        totalVenues: 8,
                        activeVenues: 8,
                        venueUtilization: [
                            { venueName: "Sân bóng đá TVU", utilizationRate: 85.5, totalBookings: 340 },
                            { venueName: "Sân cầu lông A", utilizationRate: 78.2, totalBookings: 285 },
                            { venueName: "Sân bóng rổ", utilizationRate: 72.1, totalBookings: 225 },
                            { venueName: "Sân tennis", utilizationRate: 65.8, totalBookings: 198 },
                            { venueName: "Sân bóng chuyền", utilizationRate: 58.3, totalBookings: 167 },
                        ],
                        courtUtilization: [
                            { courtName: "Sân 1", venueName: "Sân bóng đá TVU", utilizationRate: 92.1 },
                            { courtName: "Sân 2", venueName: "Sân bóng đá TVU", utilizationRate: 88.7 },
                            { courtName: "Sân A", venueName: "Sân cầu lông A", utilizationRate: 82.4 },
                            { courtName: "Sân B", venueName: "Sân cầu lông A", utilizationRate: 76.8 },
                        ],
                    });
                    break;
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
            toast.error("Không thể tải dữ liệu báo cáo");
        }
    }, [filters, router]);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchVenues(), fetchReportData()]);
            setLoading(false);
        };

        fetchInitialData();
    }, [fetchVenues, fetchReportData]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReportData();
        setRefreshing(false);
        toast.success("Đã làm mới dữ liệu");
    };

    // Handle export
    const handleExport = async (options: ExportOptions) => {
        try {
            toast.info("Đang xuất báo cáo...");

            const reportData = {
                overview: overviewStats,
                bookings: bookingStats,
                revenue: revenueStats,
                users: userStats,
                venues: venueStats,
            };

            const reportTitle = `Báo cáo ${
                options.reportType === "overview" ? "tổng quan" :
                options.reportType === "bookings" ? "đặt sân" :
                options.reportType === "revenue" ? "doanh thu" :
                options.reportType === "users" ? "người dùng" : "địa điểm"
            }`;

            const dateRange = `${format(options.dateRange.from, "dd/MM/yyyy")} - ${format(options.dateRange.to, "dd/MM/yyyy")}`;
            const filename = `${reportTitle}_${format(new Date(), "dd-MM-yyyy")}`;

            switch (options.format) {
                case "excel":
                    const ws = XLSX.utils.json_to_sheet([reportData]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, reportTitle);
                    XLSX.writeFile(wb, `${filename}.xlsx`);
                    break;

                case "csv":
                    const csvData = Object.entries(reportData).map(([key, value]) => ({
                        type: key,
                        data: JSON.stringify(value),
                    }));
                    const csvWs = XLSX.utils.json_to_sheet(csvData);
                    const csvWb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(csvWb, csvWs, "Report");
                    XLSX.writeFile(csvWb, `${filename}.csv`);
                    break;

                case "pdf":
                    const pdf = new jsPDF();
                    pdf.text(reportTitle, 20, 20);
                    pdf.text(`Thời gian: ${dateRange}`, 20, 30);
                    pdf.text("Dữ liệu báo cáo đã được tạo thành công", 20, 50);
                    pdf.save(`${filename}.pdf`);
                    break;
            }

            toast.success("Xuất báo cáo thành công");
        } catch (error) {
            console.error("Error exporting report:", error);
            toast.error("Không thể xuất báo cáo");
        }
    };

    // Render report content based on type
    const renderReportContent = () => {
        if (loading) {
            return <LoadingSpinner message="Đang tải dữ liệu báo cáo..." />;
        }

        switch (filters.reportType) {
            case "overview":
                return (
                    <OverviewReport
                        stats={overviewStats}
                        chartData={{
                            bookingsTrend: Array.from({ length: 30 }, (_, i) => ({
                                name: format(subDays(new Date(), 29 - i), "dd/MM"),
                                value: Math.floor(Math.random() * 50) + 20,
                            })),
                            revenueTrend: Array.from({ length: 30 }, (_, i) => ({
                                name: format(subDays(new Date(), 29 - i), "dd/MM"),
                                value: Math.floor(Math.random() * 5000000) + 2000000,
                            })),
                            topVenues: [
                                { name: "Sân bóng đá TVU", value: 340 },
                                { name: "Sân cầu lông A", value: 285 },
                                { name: "Sân bóng rổ", value: 225 },
                                { name: "Sân tennis", value: 198 },
                                { name: "Sân bóng chuyền", value: 167 },
                            ],
                        }}
                        loading={false}
                    />
                );

            case "bookings":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* ✅ Sửa lỗi: Thay {} thành [] */}
                            {[{
                                title: "Tổng đặt sân",
                                value: bookingStats.totalBookings,
                                color: "#3B82F6",
                            },
                            {
                                title: "Đã xác nhận",
                                value: bookingStats.confirmedBookings,
                                color: "#10B981",
                            },
                            {
                                title: "Chờ xử lý",
                                value: bookingStats.pendingBookings,
                                color: "#F59E0B",
                            },
                            {
                                title: "Đã hủy",
                                value: bookingStats.cancelledBookings,
                                color: "#EF4444",
                            },
                            {
                                title: "Hoàn thành",
                                value: bookingStats.completedBookings,
                                color: "#8B5CF6",
                            }].map((stat, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg shadow">
                                    <h3 className="text-sm text-gray-600">{stat.title}</h3>
                                    <p className="text-2xl font-bold" style={{ color: stat.color }}>
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Xu hướng đặt sân theo ngày"
                                // ✅ Sửa lỗi: Transform data để match ChartDataPoint interface
                                data={bookingStats.dailyBookings.map(item => ({
                                    name: item.date,
                                    value: item.count,
                                }))}
                                type="area"
                                color="#3B82F6"
                            />
                            <ReportChart
                                title="Giờ cao điểm"
                                // ✅ Sửa lỗi: Transform data để match ChartDataPoint interface
                                data={bookingStats.peakHours.map(item => ({
                                    name: item.hour,
                                    value: item.count,
                                }))}
                                type="bar"
                                color="#10B981"
                            />
                        </div>
                    </div>
                );

            case "revenue":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-sm text-gray-600">Tổng doanh thu</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(revenueStats.totalRevenue)}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Doanh thu hàng ngày"
                                // ✅ Sửa lỗi: Transform data để match ChartDataPoint interface
                                data={revenueStats.dailyRevenue.map(item => ({
                                    name: item.date,
                                    value: item.amount,
                                }))}
                                type="line"
                                color="#10B981"
                            />
                            <ReportChart
                                title="Doanh thu theo tháng"
                                // ✅ Sửa lỗi: Transform data để match ChartDataPoint interface
                                data={revenueStats.monthlyRevenue.map(item => ({
                                    name: item.month,
                                    value: item.amount,
                                }))}
                                type="bar"
                                color="#3B82F6"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Doanh thu theo địa điểm"
                                data={revenueStats.revenueByVenue.map(item => ({
                                    name: item.venueName,
                                    value: item.amount,
                                }))}
                                type="bar"
                                color="#F59E0B"
                            />
                            <ReportChart
                                title="Phương thức thanh toán"
                                data={revenueStats.paymentMethods.map(item => ({
                                    name: item.method,
                                    value: item.amount,
                                }))}
                                type="pie"
                            />
                        </div>
                    </div>
                );

            case "users":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* ✅ Sửa lỗi: Thay {} thành [] */}
                            {[{
                                title: "Tổng người dùng",
                                value: userStats.totalUsers,
                            },
                            {
                                title: "Người dùng hoạt động",
                                value: userStats.activeUsers,
                            },
                            {
                                title: "Người dùng mới",
                                value: userStats.newUsers,
                            }].map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-sm text-gray-600">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Xu hướng tăng trưởng người dùng"
                                // ✅ Sửa lỗi: Transform data để match ChartDataPoint interface
                                data={userStats.userGrowth.map(item => ({
                                    name: item.date,
                                    value: item.count,
                                }))}
                                type="area"
                                color="#8B5CF6"
                            />
                            <ReportChart
                                title="Phân loại người dùng"
                                data={userStats.usersByRole.map(item => ({
                                    name: item.role,
                                    value: item.count,
                                }))}
                                type="pie"
                            />
                        </div>
                    </div>
                );

            case "venues":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ✅ Sửa lỗi: Thay {} thành [] */}
                            {[{
                                title: "Tổng địa điểm",
                                value: venueStats.totalVenues,
                            },
                            {
                                title: "Địa điểm hoạt động",
                                value: venueStats.activeVenues,
                            }].map((stat, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow">
                                    <h3 className="text-sm text-gray-600">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <ReportChart
                                title="Tỷ lệ sử dụng theo địa điểm"
                                data={venueStats.venueUtilization.map(item => ({
                                    name: item.venueName,
                                    value: item.utilizationRate,
                                }))}
                                type="bar"
                                color="#10B981"
                                height={400}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DashboardLayout activeTab="reports">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Báo cáo & Thống kê
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Theo dõi và phân tích dữ liệu hệ thống
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <ReportFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                    venues={venues}
                    loading={refreshing}
                />

                {/* Report Content */}
                {renderReportContent()}
            </div>
        </DashboardLayout>
    );
}