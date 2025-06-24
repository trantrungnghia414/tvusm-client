// client/src/app/(admin)/dashboard/activity-log/components/ActivityStats.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Activity,
    AlertTriangle,
    Calendar,
    Clock,
} from "lucide-react";
import { ActivityLogStats } from "../types/activityTypes";

interface ActivityStatsProps {
    stats: ActivityLogStats;
    loading?: boolean;
}

export default function ActivityStats({
    stats,
    loading = false,
}: ActivityStatsProps) {
    const statsCards = [
        {
            title: "Tổng hoạt động",
            value: stats.total.toLocaleString(),
            subtitle: "Tất cả thời gian",
            icon: <Activity className="h-4 w-4" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: `+${stats.today} hôm nay`,
        },
        {
            title: "Hoạt động hôm nay",
            value: stats.today.toLocaleString(),
            subtitle: "24 giờ qua",
            icon: <Clock className="h-4 w-4" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: `${stats.thisWeek} tuần này`,
        },
        {
            title: "Hoạt động tuần",
            value: stats.thisWeek.toLocaleString(),
            subtitle: "7 ngày qua",
            icon: <Calendar className="h-4 w-4" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: `${stats.thisMonth} tháng này`,
        },
        {
            title: "Cảnh báo cao",
            value:
                (stats.bySeverity.high || 0) + (stats.bySeverity.critical || 0),
            subtitle: "Cần chú ý",
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-red-600",
            bgColor: "bg-red-50",
            change:
                stats.bySeverity.critical > 0
                    ? `${stats.bySeverity.critical} nghiêm trọng`
                    : "Bình thường",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsCards.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </p>
                            <div className={`${stat.bgColor} p-2 rounded-lg`}>
                                <div className={stat.color}>{stat.icon}</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-500">
                                {stat.subtitle}
                            </p>
                            {stat.change && (
                                <p
                                    className={`text-xs ${
                                        stat.change.includes("nghiêm trọng")
                                            ? "text-red-500"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {stat.change}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
