// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceStats.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Wrench,
    Calendar,
    Clock,
    CheckCircle2,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Activity,
} from "lucide-react";
import type { MaintenanceStats } from "../types/maintenance";
import { formatCurrency } from "@/lib/utils";

interface MaintenanceStatsProps {
    stats: MaintenanceStats;
    loading?: boolean;
}

export default function MaintenanceStats({
    stats,
    loading = false,
}: MaintenanceStatsProps) {
    const statsData = [
        {
            title: "Tổng bảo trì",
            value: stats.total_maintenances.toLocaleString(),
            subtitle: "Tất cả hoạt động",
            icon: <Wrench className="h-4 w-4" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: `${stats.this_month_count} tháng này`,
        },
        {
            title: "Đã lên lịch",
            value: stats.scheduled_count.toLocaleString(),
            subtitle: "Chờ thực hiện",
            icon: <Calendar className="h-4 w-4" />,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            urgent: stats.overdue_count > 0,
            change: `${stats.overdue_count} quá hạn`,
        },
        {
            title: "Đang thực hiện",
            value: stats.in_progress_count.toLocaleString(),
            subtitle: "Đang bảo trì",
            icon: <Activity className="h-4 w-4" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: `${stats.high_priority_count} ưu tiên cao`,
        },
        {
            title: "Hoàn thành",
            value: stats.completed_count.toLocaleString(),
            subtitle: "Đã xong",
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: `${stats.completed_on_time_rate.toFixed(1)}% đúng hạn`,
        },
        {
            title: "Chi phí ước tính",
            value: formatCurrency(stats.total_estimated_cost),
            subtitle: "Tổng dự toán",
            icon: <DollarSign className="h-4 w-4" />,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
            change: `${(
                (stats.total_actual_cost / stats.total_estimated_cost) *
                100
            ).toFixed(1)}% thực tế`,
        },
        {
            title: "Chi phí thực tế",
            value: formatCurrency(stats.total_actual_cost),
            subtitle: "Đã chi trả",
            icon: <TrendingUp className="h-4 w-4" />,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            change:
                stats.total_actual_cost > stats.total_estimated_cost
                    ? "Vượt dự toán"
                    : "Trong dự toán",
        },
        {
            title: "Thời gian TB",
            value: `${stats.average_completion_time.toFixed(1)}h`,
            subtitle: "Hoàn thành",
            icon: <Clock className="h-4 w-4" />,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            change: "Trung bình",
        },
        {
            title: "Bảo trì dự phòng",
            value: `${stats.preventive_percentage.toFixed(1)}%`,
            subtitle: "Tỷ lệ phòng ngừa",
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            change: stats.preventive_percentage > 60 ? "Tốt" : "Cần cải thiện",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsData.map((stat, index) => (
                <Card
                    key={index}
                    className={`${
                        stat.urgent ? "ring-2 ring-orange-200 shadow-lg" : ""
                    }`}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            {stat.urgent && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                    Cần chú ý
                                </span>
                            )}
                        </div>
                        <div className={`p-2 ${stat.bgColor} rounded-md`}>
                            <div className={stat.color}>{stat.icon}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {stat.value}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            {stat.subtitle}
                        </p>
                        {stat.change && (
                            <p
                                className={`text-xs ${
                                    stat.change.includes("quá hạn") ||
                                    stat.change.includes("Vượt")
                                        ? "text-red-500"
                                        : stat.change.includes("Tốt") ||
                                          stat.change.includes("đúng hạn")
                                        ? "text-green-500"
                                        : "text-gray-500"
                                }`}
                            >
                                {stat.change}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
