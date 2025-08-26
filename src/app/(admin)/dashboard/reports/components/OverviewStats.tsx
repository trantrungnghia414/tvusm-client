"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    DollarSign,
    BarChart3,
    PieChart,
    Users,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OverviewStatsProps {
    stats: {
        total_revenue: number;
        total_bookings: number;
        avg_booking_value: number;
        repeat_customer_rate: number;
        revenue_growth: number;
        booking_growth: number;
        top_court_type: string;
        peak_hour: string;
    };
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
    // Get growth color
    const getGrowthColor = (growth: number) => {
        if (growth > 0) return "text-green-600";
        if (growth < 0) return "text-red-600";
        return "text-gray-600";
    };

    // Get growth icon
    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <TrendingUp className="h-4 w-4" />;
        if (growth < 0) return <TrendingDown className="h-4 w-4" />;
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tổng doanh thu */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng doanh thu
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.total_revenue)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                    <div
                        className={`flex items-center gap-1 mt-4 text-sm ${getGrowthColor(
                            stats.revenue_growth
                        )}`}
                    >
                        {getGrowthIcon(stats.revenue_growth)}
                        <span>
                            {stats.revenue_growth > 0 ? "+" : ""}
                            {stats.revenue_growth.toFixed(1)}%
                        </span>
                        <span className="text-gray-600">so với kỳ trước</span>
                    </div>
                </CardContent>
            </Card>

            {/* Tổng đặt sân */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tổng đặt sân
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.total_bookings.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div
                        className={`flex items-center gap-1 mt-4 text-sm ${getGrowthColor(
                            stats.booking_growth
                        )}`}
                    >
                        {getGrowthIcon(stats.booking_growth)}
                        <span>
                            {stats.booking_growth > 0 ? "+" : ""}
                            {stats.booking_growth.toFixed(1)}%
                        </span>
                        <span className="text-gray-600">so với kỳ trước</span>
                    </div>
                </CardContent>
            </Card>

            {/* Giá trị TB/đặt sân */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Giá trị TB/đặt sân
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.avg_booking_value)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <PieChart className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <span>Loại sân phổ biến: </span>
                        <span className="font-medium">
                            {stats.top_court_type}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Tỷ lệ khách quen */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Tỷ lệ khách quen
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.repeat_customer_rate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Users className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <span>Giờ cao điểm: </span>
                        <span className="font-medium">{stats.peak_hour}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
