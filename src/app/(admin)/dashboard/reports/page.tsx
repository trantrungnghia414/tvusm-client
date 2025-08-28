"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCcw, Download } from "lucide-react";
import { subDays, startOfYear, endOfYear, format } from "date-fns";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Import components
import OverviewStats from "./components/OverviewStats";
import ReportFilters from "./components/ReportFilters";
import RevenueChart from "./components/RevenueChart";
import TopCustomers from "./components/TopCustomers";
import CourtPerformance from "./components/CourtPerformance";
import PaymentStats from "./components/PaymentStats";
import HourlyAnalytics from "./components/HourlyAnalytics";

// Interfaces (giữ nguyên các interface đã có)
interface RevenueData {
    date: string;
    revenue: number;
    bookings_count: number;
}

interface TopCustomer {
    customer_id: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    total_bookings: number;
    total_revenue: number;
    last_booking_date: string;
}

interface CourtRevenue {
    court_id: number;
    court_name: string;
    court_type: string;
    venue_name: string;
    total_bookings: number;
    total_revenue: number;
    utilization_rate: number;
    avg_booking_value: number;
}

interface PaymentMethodStats {
    payment_method: string;
    total_amount: number;
    transaction_count: number;
    percentage: number;
}

interface HourlyStats {
    hour: string;
    bookings_count: number;
    revenue: number;
}

interface ReportsStats {
    total_revenue: number;
    total_bookings: number;
    avg_booking_value: number;
    revenue_growth: number;
    booking_growth: number;
    top_court_type: string;
    peak_hour: string;
    repeat_customer_rate: number;
}

export default function ReportsPage() {
    const router = useRouter();

    // States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reportPeriod, setReportPeriod] = useState("30d");
    const [startDate, setStartDate] = useState<Date | undefined>(
        subDays(new Date(), 30)
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [selectedCourtType, setSelectedCourtType] = useState("all");
    const [selectedCourt, setSelectedCourt] = useState("all");

    // Data states
    const [stats, setStats] = useState<ReportsStats>({
        total_revenue: 0,
        total_bookings: 0,
        avg_booking_value: 0,
        revenue_growth: 0,
        booking_growth: 0,
        top_court_type: "",
        peak_hour: "",
        repeat_customer_rate: 0,
    });
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [courtRevenue, setCourtRevenue] = useState<CourtRevenue[]>([]);
    const [paymentMethodStats, setPaymentMethodStats] = useState<
        PaymentMethodStats[]
    >([]);
    const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([]);

    // Filter options
    const [courtTypes, setCourtTypes] = useState<
        Array<{ type_id: number; name: string }>
    >([]);
    const [courts, setCourts] = useState<
        Array<{ court_id: number; name: string; type_id: number }>
    >([]);

    // Handle period change
    const handlePeriodChange = useCallback((period: string) => {
        setReportPeriod(period);
        const now = new Date();

        switch (period) {
            case "all":
                // Toàn thời gian - không giới hạn startDate và endDate
                setStartDate(undefined);
                setEndDate(undefined);
                break;
            case "7d":
                setStartDate(subDays(now, 7));
                setEndDate(now);
                break;
            case "30d":
                setStartDate(subDays(now, 30));
                setEndDate(now);
                break;
            case "90d":
                setStartDate(subDays(now, 90));
                setEndDate(now);
                break;
            case "1y":
                setStartDate(startOfYear(now));
                setEndDate(endOfYear(now));
                break;
            case "custom":
                // Keep current dates
                break;
        }
    }, []);

    // Fetch report data from API
    const fetchReportData = useCallback(async () => {
        // Chỉ kiểm tra startDate và endDate khi không phải "toàn thời gian"
        if (reportPeriod !== "all" && (!startDate || !endDate)) return;

        try {
            setRefreshing(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const params = new URLSearchParams();

            // Chỉ thêm tham số ngày khi không phải "toàn thời gian"
            if (reportPeriod !== "all" && startDate && endDate) {
                params.append("start_date", format(startDate, "yyyy-MM-dd"));
                params.append("end_date", format(endDate, "yyyy-MM-dd"));
            }

            params.append("court_type", selectedCourtType);
            params.append("court", selectedCourt);

            // Fetch all reports in parallel
            const [
                statsRes,
                revenueRes,
                customersRes,
                courtsRes,
                paymentRes,
                hourlyRes,
            ] = await Promise.all([
                fetchApi(`/reports/stats?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`/reports/revenue-timeline?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`/reports/top-customers?${params}&limit=10`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`/reports/court-performance?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`/reports/payment-methods?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi(`/reports/hourly-stats?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            // Process responses
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data);
            }

            if (revenueRes.ok) {
                const data = await revenueRes.json();
                setRevenueData(data);
            }

            if (customersRes.ok) {
                const data = await customersRes.json();
                setTopCustomers(data);
            }

            if (courtsRes.ok) {
                const data = await courtsRes.json();
                setCourtRevenue(data);
            }

            if (paymentRes.ok) {
                const data = await paymentRes.json();
                setPaymentMethodStats(data);
            }

            if (hourlyRes.ok) {
                const data = await hourlyRes.json();
                setHourlyStats(data);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
            toast.error("Không thể tải dữ liệu báo cáo");
        } finally {
            setRefreshing(false);
        }
    }, [
        startDate,
        endDate,
        selectedCourtType,
        selectedCourt,
        reportPeriod,
        router,
    ]);

    // Fetch filter options
    const fetchFilterOptions = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Sử dụng endpoint mới để lấy tất cả filter options
            const filterRes = await fetchApi("/reports/filter-options", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (filterRes.ok) {
                const data = await filterRes.json();
                setCourtTypes(data.courtTypes || []);
                setCourts(data.courts || []);
            } else {
                // Fallback: lấy từ các endpoint riêng lẻ
                const courtTypesRes = await fetchApi("/court-types", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (courtTypesRes.ok) {
                    const data = await courtTypesRes.json();
                    setCourtTypes(data);
                }

                // Fetch courts separately
                const courtsRes = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (courtsRes.ok) {
                    const data = await courtsRes.json();
                    setCourts(data);
                }
            }
        } catch (error) {
            console.error("Error fetching filter options:", error);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchFilterOptions(), fetchReportData()]);
            setLoading(false);
        };

        fetchAllData();
    }, [fetchFilterOptions, fetchReportData]);

    // Handle refresh
    const handleRefresh = () => {
        fetchReportData();
        toast.success("Đã làm mới dữ liệu báo cáo");
    };

    // Handle export
    const handleExport = () => {
        // TODO: Implement export functionality
        toast.success("Đang xuất báo cáo...");
    };

    // Handle view customer
    const handleViewCustomer = (customerId: number) => {
        router.push(`/dashboard/users/${customerId}`);
    };

    // Handle view court
    const handleViewCourt = (courtId: number) => {
        router.push(`/dashboard/courts/${courtId}`);
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="reports">
                <LoadingSpinner message="Đang tải báo cáo..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="reports">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Báo cáo thống kê
                            </h1>
                            <p className="text-gray-600">
                                Phân tích doanh thu và hiệu suất kinh doanh
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCcw
                                className={`h-4 w-4 mr-2 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                            Làm mới
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Xuất báo cáo
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <ReportFilters
                    reportPeriod={reportPeriod}
                    startDate={startDate}
                    endDate={endDate}
                    selectedCourtType={selectedCourtType}
                    selectedCourt={selectedCourt}
                    courtTypes={courtTypes}
                    courts={courts}
                    onPeriodChange={handlePeriodChange}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onCourtTypeChange={setSelectedCourtType}
                    onCourtChange={setSelectedCourt}
                />

                {/* Overview Stats */}
                <OverviewStats stats={stats} />

                {/* Revenue Timeline Chart */}
                <RevenueChart data={revenueData} />

                {/* Top Customers & Court Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TopCustomers
                        customers={topCustomers}
                        onViewCustomer={handleViewCustomer}
                    />
                    <CourtPerformance
                        courts={courtRevenue}
                        onViewCourt={handleViewCourt}
                    />
                </div>

                {/* Payment Methods & Hourly Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PaymentStats paymentMethods={paymentMethodStats} />
                    <HourlyAnalytics hourlyData={hourlyStats} />
                </div>
            </div>
        </DashboardLayout>
    );
}
