// client/src/app/(admin)/dashboard/reports/components/OverviewReport.tsx
"use client";

import React from "react";
import {
    Users,
    Calendar,
    DollarSign,
    Building,
    Star,
    TrendingUp,
    TrendingDown,
    Activity,
} from "lucide-react";
import ReportStatsCard from "./ReportStatsCard";
import ReportChart from "./ReportChart";
import { OverviewStats } from "../types/reportTypes";

interface OverviewReportProps {
    stats: OverviewStats;
    chartData: {
        bookingsTrend: Array<{ name: string; value: number }>;
        revenueTrend: Array<{ name: string; value: number }>;
        topVenues: Array<{ name: string; value: number }>;
    };
    loading?: boolean;
}

export default function OverviewReport({
    stats,
    chartData,
    loading = false,
}: OverviewReportProps) {
    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const statsCards = [
        {
            title: "Tổng số đặt sân",
            value: stats.totalBookings,
            icon: Calendar,
            change: "+12% từ tháng trước",
            changeType: "positive" as const,
            description: "Tổng số lượt đặt sân",
        },
        {
            title: "Tổng doanh thu",
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            change: "+8% từ tháng trước",
            changeType: "positive" as const,
            description: "Doanh thu từ đặt sân",
        },
        {
            title: "Người dùng",
            value: stats.totalUsers,
            icon: Users,
            change: "+15% từ tháng trước",
            changeType: "positive" as const,
            description: "Tổng số người dùng",
        },
        {
            title: "Địa điểm",
            value: stats.totalVenues,
            icon: Building,
            change: "Không đổi",
            changeType: "neutral" as const,
            description: "Số địa điểm hoạt động",
        },
        {
            title: "Đánh giá trung bình",
            value: `${stats.averageRating.toFixed(1)}/5`,
            icon: Star,
            change: "+0.2 từ tháng trước",
            changeType: "positive" as const,
            description: "Đánh giá từ khách hàng",
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: `${stats.completionRate.toFixed(1)}%`,
            icon: TrendingUp,
            change: "+2% từ tháng trước",
            changeType: "positive" as const,
            description: "Đặt sân hoàn thành",
        },
        {
            title: "Tỷ lệ hủy",
            value: `${stats.cancellationRate.toFixed(1)}%`,
            icon: TrendingDown,
            change: "-1% từ tháng trước",
            changeType: "positive" as const,
            description: "Đặt sân bị hủy",
        },
        {
            title: "Địa điểm phổ biến",
            value: stats.topVenue.name,
            icon: Activity,
            change: `${stats.topVenue.bookings} lượt đặt`,
            changeType: "neutral" as const,
            description: "Địa điểm được đặt nhiều nhất",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <ReportStatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        change={stat.change}
                        changeType={stat.changeType}
                        description={stat.description}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReportChart
                    title="Xu hướng đặt sân"
                    data={chartData.bookingsTrend}
                    type="area"
                    color="#3B82F6"
                    loading={loading}
                    description="Số lượt đặt sân theo thời gian"
                />

                <ReportChart
                    title="Xu hướng doanh thu"
                    data={chartData.revenueTrend}
                    type="line"
                    color="#10B981"
                    loading={loading}
                    description="Doanh thu theo thời gian"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ReportChart
                        title="Top địa điểm được đặt nhiều nhất"
                        data={chartData.topVenues}
                        type="bar"
                        color="#F59E0B"
                        loading={loading}
                        description="Số lượt đặt theo địa điểm"
                        height={350}
                    />
                </div>

                <ReportChart
                    title="Phân bố loại đặt sân"
                    data={[
                        {
                            name: "Hoàn thành",
                            value: stats.completionRate,
                            color: "#10B981",
                        },
                        {
                            name: "Đã hủy",
                            value: stats.cancellationRate,
                            color: "#EF4444",
                        },
                        {
                            name: "Khác",
                            value:
                                100 -
                                stats.completionRate -
                                stats.cancellationRate,
                            color: "#6B7280",
                        },
                    ]}
                    type="pie"
                    loading={loading}
                    description="Tỷ lệ phần trăm các loại đặt sân"
                    height={350}
                />
            </div>
        </div>
    );
}
