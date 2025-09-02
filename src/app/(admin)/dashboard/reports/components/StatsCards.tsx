"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
    period: string;
    revenue?: {
        total?: number | null;
        growth?: number | null;
        target?: number | null;
        achievement?: number | null;
    };
    bookings?: {
        total?: number | null;
        growth?: number | null;
        avgValue?: number | null;
    };
    customers?: {
        total?: number | null;
        active?: number | null;
        new?: number | null;
        retention?: number | null;
    };
    courts?: {
        totalCourts?: number | null;
        avgUtilization?: number | null;
        topPerformer?: string | null;
    };
}

interface StatsCardsProps {
    stats?: DashboardStats | null;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    // Thêm debug logging
    console.log("StatsCards received stats:", stats);
    console.log("Revenue total:", stats?.revenue?.total);
    console.log("Revenue growth:", stats?.revenue?.growth);

    // Hàm xử lý số an toàn
    const safeNumber = (value: unknown, defaultValue = 0) => {
        if (value === null || value === undefined || isNaN(Number(value))) {
            return defaultValue;
        }
        return Number(value) || defaultValue;
    };

    const formatGrowth = (growth: number) => {
        const safeGrowth = safeNumber(growth);
        const isPositive = safeGrowth >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? "text-green-600" : "text-red-600";

        return (
            <div className={`flex items-center gap-1 ${colorClass}`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                    {Math.abs(safeGrowth).toFixed(1)}%
                </span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Tổng doanh thu
                    </CardTitle>
                    <div className="p-2.5 bg-green-100 rounded-xl">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0 -mt-8">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                        {formatCurrency(safeNumber(stats?.revenue?.total))}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        {formatGrowth(safeNumber(stats?.revenue?.growth))}
                        <p className="text-xs text-gray-500">so với kỳ trước</p>
                    </div>
                    {stats?.revenue?.target && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Mục tiêu</span>
                                <span className="font-medium text-gray-700">
                                    {formatCurrency(
                                        safeNumber(stats.revenue.target)
                                    )}
                                </span>
                            </div>
                            {stats?.revenue?.achievement && (
                                <div className="flex justify-between items-center text-xs mt-1">
                                    <span className="text-gray-500">
                                        Hoàn thành
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {safeNumber(
                                            stats.revenue.achievement
                                        ).toFixed(1)}
                                        %
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bookings Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Lượt đặt sân
                    </CardTitle>
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                        <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0 -mt-8">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                        {safeNumber(stats?.bookings?.total).toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        {formatGrowth(safeNumber(stats?.bookings?.growth))}
                        <p className="text-xs text-gray-500">so với kỳ trước</p>
                    </div>
                </CardContent>
            </Card>

            {/* Customers Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Khách hàng
                    </CardTitle>
                    <div className="p-2.5 bg-purple-100 rounded-xl">
                        <Users className="h-5 w-5 text-purple-600" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0 -mt-8">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                        {safeNumber(stats?.customers?.total).toLocaleString()}
                    </div>
                    <div className="space-y-2">
                        {/* <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Hoạt động</span>
                            <span className="font-medium text-gray-700">
                                {safeNumber(stats?.customers?.active)}
                            </span>
                        </div> */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Mới</span>
                            <span className="font-semibold text-green-600">
                                +{safeNumber(stats?.customers?.new)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courts Card */}
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-semibold text-gray-700">
                        Sân thể thao
                    </CardTitle>
                    <div className="p-2.5 bg-orange-100 rounded-xl">
                        <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                </CardHeader>
                <CardContent className="pt-0 -mt-8">
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                        {safeNumber(stats?.courts?.totalCourts)}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500">Hàng đầu</span>
                            <span
                                className="font-medium text-blue-600 truncate max-w-200"
                                title={stats?.courts?.topPerformer || "N/A"}
                            >
                                {stats?.courts?.topPerformer || "N/A"}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
