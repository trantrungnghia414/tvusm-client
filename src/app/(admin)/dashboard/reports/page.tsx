// trang quản lý báo cáo
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subDays, format } from "date-fns";
import DashboardLayout from "../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ReportFilters from "./components/ReportFilters";
import ReportChart from "./components/ReportChart";
import {
    ReportFilters as FilterType,
    RevenueStats,
    CustomerStats,
    VenueStats,
    BookingStats,
    ExportOptions,
} from "./types/reportTypes";
import { fetchApi } from "@/lib/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface VenueData {
    venue_id: number;
    name: string;
}

interface CustomerData {
    user_id: number;
    full_name: string;
}

export default function ReportsPage() {
    const router = useRouter();

    // Filter state
    const [filters, setFilters] = useState<FilterType>({
        dateRange: {
            from: subDays(new Date(), 30),
            to: new Date(),
        },
        reportType: "revenue",
        period: "daily",
    });

    // Data states
    const [revenueStats, setRevenueStats] = useState<RevenueStats>({
        totalRevenue: 0,
        totalBookings: 0,
        averageRevenuePerBooking: 0,
        revenueGrowth: 0,
        dailyRevenue: [],
        weeklyRevenue: [],
        monthlyRevenue: [],
        quarterlyRevenue: [],
        yearlyRevenue: [],
        revenueByCustomer: [],
        customerBookingFrequency: [],
        revenueByVenue: [],
        revenueByCourt: [],
        paymentMethods: [],
        revenueBySportType: [],
    });

    const [customerStats, setCustomerStats] = useState<CustomerStats>({
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        bookingFrequency: [],
        topCustomers: [],
        customerGrowth: [],
        customersByType: [],
    });

    const [venueStats, setVenueStats] = useState<VenueStats>({
        totalVenues: 0,
        activeVenues: 0,
        totalCourts: 0,
        activeCourts: 0,
        venueUtilization: [],
        courtUtilization: [],
        utilizationBySportType: [],
        utilizationTrend: [],
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

    const [venues, setVenues] = useState<VenueData[]>([]);
    const [customers, setCustomers] = useState<CustomerData[]>([]);
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
                setVenues(
                    data.map((venue: VenueData) => ({
                        venue_id: venue.venue_id,
                        name: venue.name,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, []);

    // Fetch customers for filter
    const fetchCustomers = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi("/users", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(
                    data.map((customer: CustomerData) => ({
                        user_id: customer.user_id,
                        full_name: customer.full_name,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
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
                case "revenue":
                    setRevenueStats({
                        totalRevenue: 125000000,
                        totalBookings: 1250,
                        averageRevenuePerBooking: 100000,
                        revenueGrowth: 8.5,
                        dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
                            date: format(subDays(new Date(), 29 - i), "dd/MM"),
                            amount:
                                Math.floor(Math.random() * 5000000) + 2000000,
                            bookings: Math.floor(Math.random() * 50) + 20,
                        })),
                        weeklyRevenue: Array.from({ length: 12 }, (_, i) => ({
                            week: `Tuần ${i + 1}`,
                            amount:
                                Math.floor(Math.random() * 30000000) + 15000000,
                            bookings: Math.floor(Math.random() * 300) + 150,
                        })),
                        monthlyRevenue: [
                            { month: "Jan", amount: 45000000, bookings: 450 },
                            { month: "Feb", amount: 52000000, bookings: 520 },
                            { month: "Mar", amount: 48000000, bookings: 480 },
                            { month: "Apr", amount: 61000000, bookings: 610 },
                            { month: "May", amount: 55000000, bookings: 550 },
                            { month: "Jun", amount: 67000000, bookings: 670 },
                        ],
                        quarterlyRevenue: [
                            {
                                quarter: "Q1",
                                amount: 145000000,
                                bookings: 1450,
                            },
                            {
                                quarter: "Q2",
                                amount: 173000000,
                                bookings: 1730,
                            },
                            {
                                quarter: "Q3",
                                amount: 189000000,
                                bookings: 1890,
                            },
                            {
                                quarter: "Q4",
                                amount: 210000000,
                                bookings: 2100,
                            },
                        ],
                        yearlyRevenue: [
                            { year: "2022", amount: 580000000, bookings: 5800 },
                            { year: "2023", amount: 720000000, bookings: 7200 },
                            { year: "2024", amount: 125000000, bookings: 1250 },
                        ],
                        revenueByCustomer: [
                            {
                                customerId: 1,
                                customerName: "Nguyễn Văn A",
                                totalAmount: 4500000,
                                totalBookings: 45,
                                averageAmount: 100000,
                                lastBookingDate: "15/01/2024",
                            },
                            {
                                customerId: 2,
                                customerName: "Trần Thị B",
                                totalAmount: 3800000,
                                totalBookings: 38,
                                averageAmount: 100000,
                                lastBookingDate: "12/01/2024",
                            },
                        ],
                        customerBookingFrequency: [
                            {
                                frequency: "1-2 lần/tháng",
                                customerCount: 150,
                                totalRevenue: 45000000,
                            },
                            {
                                frequency: "3-5 lần/tháng",
                                customerCount: 200,
                                totalRevenue: 60000000,
                            },
                            {
                                frequency: "6-10 lần/tháng",
                                customerCount: 100,
                                totalRevenue: 35000000,
                            },
                            {
                                frequency: "10+ lần/tháng",
                                customerCount: 35,
                                totalRevenue: 15000000,
                            },
                        ],
                        revenueByVenue: [
                            {
                                venueId: 1,
                                venueName: "Sân bóng đá TVU",
                                totalAmount: 35000000,
                                totalBookings: 340,
                                averageAmount: 102941,
                                utilizationRate: 85.5,
                            },
                            {
                                venueId: 2,
                                venueName: "Sân cầu lông A",
                                totalAmount: 28000000,
                                totalBookings: 285,
                                averageAmount: 98246,
                                utilizationRate: 78.2,
                            },
                        ],
                        revenueByCourt: [
                            {
                                courtId: 1,
                                courtName: "Sân 1",
                                venueName: "Sân bóng đá TVU",
                                totalAmount: 18000000,
                                totalBookings: 180,
                                averageAmount: 100000,
                                utilizationRate: 92.1,
                            },
                            {
                                courtId: 2,
                                courtName: "Sân 2",
                                venueName: "Sân bóng đá TVU",
                                totalAmount: 17000000,
                                totalBookings: 160,
                                averageAmount: 106250,
                                utilizationRate: 88.7,
                            },
                        ],
                        paymentMethods: [
                            {
                                method: "Tiền mặt",
                                amount: 45000000,
                                count: 450,
                                percentage: 36,
                            },
                            {
                                method: "Chuyển khoản",
                                amount: 58000000,
                                count: 520,
                                percentage: 46.4,
                            },
                            {
                                method: "Ví điện tử",
                                amount: 22000000,
                                count: 280,
                                percentage: 17.6,
                            },
                        ],
                        revenueBySportType: [
                            {
                                sportType: "Bóng đá",
                                amount: 45000000,
                                bookings: 450,
                                percentage: 36,
                            },
                            {
                                sportType: "Cầu lông",
                                amount: 35000000,
                                bookings: 350,
                                percentage: 28,
                            },
                            {
                                sportType: "Bóng rổ",
                                amount: 25000000,
                                bookings: 250,
                                percentage: 20,
                            },
                            {
                                sportType: "Tennis",
                                amount: 15000000,
                                bookings: 150,
                                percentage: 12,
                            },
                            {
                                sportType: "Khác",
                                amount: 5000000,
                                bookings: 50,
                                percentage: 4,
                            },
                        ],
                    });
                    break;

                case "customers":
                    setCustomerStats({
                        totalCustomers: 485,
                        activeCustomers: 342,
                        newCustomers: 67,
                        returningCustomers: 275,
                        bookingFrequency: [
                            {
                                frequency: "1-2 lần/tháng",
                                customerCount: 150,
                                percentage: 30.9,
                            },
                            {
                                frequency: "3-5 lần/tháng",
                                customerCount: 200,
                                percentage: 41.2,
                            },
                            {
                                frequency: "6-10 lần/tháng",
                                customerCount: 100,
                                percentage: 20.6,
                            },
                            {
                                frequency: "10+ lần/tháng",
                                customerCount: 35,
                                percentage: 7.3,
                            },
                        ],
                        topCustomers: [
                            {
                                customerId: 1,
                                customerName: "Nguyễn Văn A",
                                totalBookings: 45,
                                totalRevenue: 4500000,
                                averageRevenue: 100000,
                                lastBookingDate: "15/01/2024",
                            },
                            {
                                customerId: 2,
                                customerName: "Trần Thị B",
                                totalBookings: 38,
                                totalRevenue: 3800000,
                                averageRevenue: 100000,
                                lastBookingDate: "12/01/2024",
                            },
                        ],
                        customerGrowth: Array.from({ length: 12 }, (_, i) => ({
                            date: format(
                                subDays(new Date(), (11 - i) * 30),
                                "MM/yyyy"
                            ),
                            newCustomers: Math.floor(Math.random() * 20) + 10,
                            totalCustomers:
                                Math.floor(Math.random() * 100) + 400,
                        })),
                        customersByType: [
                            {
                                type: "Sinh viên",
                                count: 285,
                                percentage: 58.8,
                                totalRevenue: 75000000,
                            },
                            {
                                type: "Giảng viên",
                                count: 89,
                                percentage: 18.3,
                                totalRevenue: 25000000,
                            },
                            {
                                type: "Khách",
                                count: 111,
                                percentage: 22.9,
                                totalRevenue: 25000000,
                            },
                        ],
                    });
                    break;

                case "venues":
                    setVenueStats({
                        totalVenues: 8,
                        activeVenues: 8,
                        totalCourts: 15,
                        activeCourts: 15,
                        venueUtilization: [
                            {
                                venueId: 1,
                                venueName: "Sân bóng đá TVU",
                                utilizationRate: 85.5,
                                totalBookings: 340,
                                totalRevenue: 35000000,
                                averageRevenue: 102941,
                            },
                            {
                                venueId: 2,
                                venueName: "Sân cầu lông A",
                                utilizationRate: 78.2,
                                totalBookings: 285,
                                totalRevenue: 28000000,
                                averageRevenue: 98246,
                            },
                        ],
                        courtUtilization: [
                            {
                                courtId: 1,
                                courtName: "Sân 1",
                                venueName: "Sân bóng đá TVU",
                                utilizationRate: 92.1,
                                totalBookings: 180,
                                totalRevenue: 18000000,
                                averageRevenue: 100000,
                            },
                            {
                                courtId: 2,
                                courtName: "Sân 2",
                                venueName: "Sân bóng đá TVU",
                                utilizationRate: 88.7,
                                totalBookings: 160,
                                totalRevenue: 17000000,
                                averageRevenue: 106250,
                            },
                        ],
                        utilizationBySportType: [
                            {
                                sportType: "Bóng đá",
                                totalBookings: 450,
                                totalRevenue: 45000000,
                                averageUtilization: 85.5,
                            },
                            {
                                sportType: "Cầu lông",
                                totalBookings: 350,
                                totalRevenue: 35000000,
                                averageUtilization: 78.2,
                            },
                        ],
                        utilizationTrend: Array.from(
                            { length: 30 },
                            (_, i) => ({
                                date: format(
                                    subDays(new Date(), 29 - i),
                                    "dd/MM"
                                ),
                                averageUtilization:
                                    Math.floor(Math.random() * 30) + 60,
                                totalBookings:
                                    Math.floor(Math.random() * 50) + 20,
                            })
                        ),
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
            await Promise.all([
                fetchVenues(),
                fetchCustomers(),
                fetchReportData(),
            ]);
            setLoading(false);
        };

        fetchInitialData();
    }, [fetchVenues, fetchCustomers, fetchReportData]);

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
                revenue: revenueStats,
                customers: customerStats,
                venues: venueStats,
                bookings: bookingStats,
            };

            const reportTitle = `Báo cáo ${
                options.reportType === "revenue"
                    ? "doanh thu"
                    : options.reportType === "customers"
                    ? "khách hàng"
                    : options.reportType === "venues"
                    ? "sân thi đấu"
                    : "đặt sân"
            }`;

            const dateRange = `${format(
                options.dateRange.from,
                "dd/MM/yyyy"
            )} - ${format(options.dateRange.to, "dd/MM/yyyy")}`;
            const filename = `${reportTitle}_${format(
                new Date(),
                "dd-MM-yyyy"
            )}`;

            switch (options.format) {
                case "excel":
                    const ws = XLSX.utils.json_to_sheet([reportData]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, reportTitle);
                    XLSX.writeFile(wb, `${filename}.xlsx`);
                    break;

                case "csv":
                    const csvData = Object.entries(reportData).map(
                        ([key, value]) => ({
                            type: key,
                            data: JSON.stringify(value),
                        })
                    );
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
            case "revenue":
                return (
                    <div className="space-y-6">
                        {/* Revenue Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    title: "Tổng doanh thu",
                                    value: new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(revenueStats.totalRevenue),
                                    color: "#10B981",
                                },
                                {
                                    title: "Tổng đặt sân",
                                    value: revenueStats.totalBookings.toLocaleString(),
                                    color: "#3B82F6",
                                },
                                {
                                    title: "Doanh thu trung bình",
                                    value: new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(
                                        revenueStats.averageRevenuePerBooking
                                    ),
                                    color: "#F59E0B",
                                },
                                {
                                    title: "Tăng trưởng",
                                    value: `+${revenueStats.revenueGrowth}%`,
                                    color: "#8B5CF6",
                                },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg shadow"
                                >
                                    <h3 className="text-sm text-gray-600">
                                        {stat.title}
                                    </h3>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Revenue by Time Period */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Doanh thu theo thời gian"
                                data={
                                    filters.period === "daily"
                                        ? revenueStats.dailyRevenue.map(
                                              (item) => ({
                                                  name: item.date,
                                                  value: item.amount,
                                                  secondaryValue: item.bookings,
                                              })
                                          )
                                        : filters.period === "weekly"
                                        ? revenueStats.weeklyRevenue.map(
                                              (item) => ({
                                                  name: item.week,
                                                  value: item.amount,
                                                  secondaryValue: item.bookings,
                                              })
                                          )
                                        : filters.period === "monthly"
                                        ? revenueStats.monthlyRevenue.map(
                                              (item) => ({
                                                  name: item.month,
                                                  value: item.amount,
                                                  secondaryValue: item.bookings,
                                              })
                                          )
                                        : filters.period === "quarterly"
                                        ? revenueStats.quarterlyRevenue.map(
                                              (item) => ({
                                                  name: item.quarter,
                                                  value: item.amount,
                                                  secondaryValue: item.bookings,
                                              })
                                          )
                                        : revenueStats.yearlyRevenue.map(
                                              (item) => ({
                                                  name: item.year,
                                                  value: item.amount,
                                                  secondaryValue: item.bookings,
                                              })
                                          )
                                }
                                type="composed"
                                color="#3B82F6"
                                secondaryColor="#10B981"
                                showLegend={true}
                            />
                            <ReportChart
                                title="Phương thức thanh toán"
                                data={revenueStats.paymentMethods.map(
                                    (item) => ({
                                        name: item.method,
                                        value: item.amount,
                                        color:
                                            item.method === "Tiền mặt"
                                                ? "#10B981"
                                                : item.method === "Chuyển khoản"
                                                ? "#3B82F6"
                                                : "#F59E0B",
                                    })
                                )}
                                type="pie"
                                showLegend={true}
                            />
                        </div>

                        {/* Revenue by Venue and Sport Type */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Doanh thu theo sân"
                                data={revenueStats.revenueByVenue.map(
                                    (item) => ({
                                        name: item.venueName,
                                        value: item.totalAmount,
                                    })
                                )}
                                type="bar"
                                color="#F59E0B"
                            />
                            <ReportChart
                                title="Doanh thu theo loại sân"
                                data={revenueStats.revenueBySportType.map(
                                    (item) => ({
                                        name: item.sportType,
                                        value: item.amount,
                                    })
                                )}
                                type="bar"
                                color="#8B5CF6"
                            />
                        </div>

                        {/* Customer Revenue Analysis */}
                        <div className="grid grid-cols-1 gap-6">
                            <ReportChart
                                title="Tần suất đặt sân của khách hàng"
                                data={revenueStats.customerBookingFrequency.map(
                                    (item) => ({
                                        name: item.frequency,
                                        value: item.totalRevenue,
                                    })
                                )}
                                type="bar"
                                color="#06B6D4"
                                height={400}
                            />
                        </div>
                    </div>
                );

            case "customers":
                return (
                    <div className="space-y-6">
                        {/* Customer Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    title: "Tổng khách hàng",
                                    value: customerStats.totalCustomers.toLocaleString(),
                                    color: "#3B82F6",
                                },
                                {
                                    title: "Khách hàng hoạt động",
                                    value: customerStats.activeCustomers.toLocaleString(),
                                    color: "#10B981",
                                },
                                {
                                    title: "Khách hàng mới",
                                    value: customerStats.newCustomers.toLocaleString(),
                                    color: "#F59E0B",
                                },
                                {
                                    title: "Khách hàng quay lại",
                                    value: customerStats.returningCustomers.toLocaleString(),
                                    color: "#8B5CF6",
                                },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg shadow"
                                >
                                    <h3 className="text-sm text-gray-600">
                                        {stat.title}
                                    </h3>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Customer Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Tần suất đặt sân"
                                data={customerStats.bookingFrequency.map(
                                    (item) => ({
                                        name: item.frequency,
                                        value: item.customerCount,
                                    })
                                )}
                                type="pie"
                                showLegend={true}
                            />
                            <ReportChart
                                title="Tăng trưởng khách hàng"
                                data={customerStats.customerGrowth.map(
                                    (item) => ({
                                        name: item.date,
                                        value: item.totalCustomers,
                                        secondaryValue: item.newCustomers,
                                    })
                                )}
                                type="composed"
                                color="#3B82F6"
                                secondaryColor="#10B981"
                                showLegend={true}
                            />
                        </div>

                        {/* Customer Types */}
                        <div className="grid grid-cols-1 gap-6">
                            <ReportChart
                                title="Phân loại khách hàng"
                                data={customerStats.customersByType.map(
                                    (item) => ({
                                        name: item.type,
                                        value: item.count,
                                    })
                                )}
                                type="bar"
                                color="#F59E0B"
                                height={400}
                            />
                        </div>
                    </div>
                );

            case "venues":
                return (
                    <div className="space-y-6">
                        {/* Venue Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    title: "Tổng sân",
                                    value: venueStats.totalVenues.toLocaleString(),
                                    color: "#3B82F6",
                                },
                                {
                                    title: "Sân hoạt động",
                                    value: venueStats.activeVenues.toLocaleString(),
                                    color: "#10B981",
                                },
                                {
                                    title: "Tổng sân con",
                                    value: venueStats.totalCourts.toLocaleString(),
                                    color: "#F59E0B",
                                },
                                {
                                    title: "Sân con hoạt động",
                                    value: venueStats.activeCourts.toLocaleString(),
                                    color: "#8B5CF6",
                                },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg shadow"
                                >
                                    <h3 className="text-sm text-gray-600">
                                        {stat.title}
                                    </h3>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Venue Utilization */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Tỷ lệ sử dụng theo sân"
                                data={venueStats.venueUtilization.map(
                                    (item) => ({
                                        name: item.venueName,
                                        value: item.utilizationRate,
                                    })
                                )}
                                type="bar"
                                color="#10B981"
                            />
                            <ReportChart
                                title="Doanh thu theo sân"
                                data={venueStats.venueUtilization.map(
                                    (item) => ({
                                        name: item.venueName,
                                        value: item.totalRevenue,
                                    })
                                )}
                                type="bar"
                                color="#F59E0B"
                            />
                        </div>

                        {/* Utilization Trends */}
                        <div className="grid grid-cols-1 gap-6">
                            <ReportChart
                                title="Xu hướng sử dụng sân"
                                data={venueStats.utilizationTrend.map(
                                    (item) => ({
                                        name: item.date,
                                        value: item.averageUtilization,
                                        secondaryValue: item.totalBookings,
                                    })
                                )}
                                type="composed"
                                color="#3B82F6"
                                secondaryColor="#10B981"
                                showLegend={true}
                                height={400}
                            />
                        </div>
                    </div>
                );

            case "bookings":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                                {
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
                                },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg shadow"
                                >
                                    <h3 className="text-sm text-gray-600">
                                        {stat.title}
                                    </h3>
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: stat.color }}
                                    >
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportChart
                                title="Xu hướng đặt sân theo ngày"
                                data={bookingStats.dailyBookings.map(
                                    (item) => ({
                                        name: item.date,
                                        value: item.count,
                                    })
                                )}
                                type="area"
                                color="#3B82F6"
                            />
                            <ReportChart
                                title="Giờ cao điểm"
                                data={bookingStats.peakHours.map((item) => ({
                                    name: item.hour,
                                    value: item.count,
                                }))}
                                type="bar"
                                color="#10B981"
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
                    customers={customers}
                    loading={refreshing}
                />

                {/* Report Content */}
                {renderReportContent()}
            </div>
        </DashboardLayout>
    );
}
