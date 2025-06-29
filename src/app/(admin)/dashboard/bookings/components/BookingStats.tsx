// client/src/app/(admin)/dashboard/bookings/components/BookingStats.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarDays,
    Clock,
    DollarSign,
    TrendingUp,
    Users,
    CheckCircle2,
} from "lucide-react";
import { BookingStats as BookingStatsType } from "../types/booking";
import { formatCurrency } from "@/lib/utils";

interface BookingStatsProps {
    stats: BookingStatsType;
    loading?: boolean;
}

export default function BookingStats({ stats, loading = false }: BookingStatsProps) {
    // ✅ Rút gọn data config
    const statsData = [
        {
            title: "Tổng đặt sân",
            value: stats.total_bookings,
            icon: CalendarDays,
            color: "blue",
        },
        {
            title: "Hôm nay",
            value: stats.today_bookings,
            icon: Clock,
            color: "green",
        },
        {
            title: "Chờ xác nhận",
            value: stats.pending_bookings,
            icon: Users,
            color: "orange",
            urgent: stats.pending_bookings > 10,
        },
        {
            title: "Doanh thu tháng",
            value: formatCurrency(stats.monthly_revenue),
            icon: DollarSign,
            color: "purple",
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: `${stats.completion_rate}%`,
            icon: CheckCircle2,
            color: "emerald",
        },
        {
            title: "Tổng doanh thu",
            value: formatCurrency(stats.total_revenue),
            icon: TrendingUp,
            color: "indigo",
        },
    ];

    // ✅ Rút gọn color mapping
    const getColorClasses = (color: string) => ({
        text: `text-${color}-600`,
        bg: `bg-${color}-50`,
    });

    // ✅ Loading state gọn hơn
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded w-16"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color);
                
                return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`${colorClasses.bg} ${colorClasses.text} p-2 rounded-lg`}>
                                <Icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    {stat.value}
                                </span>
                                {stat.urgent && (
                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                        Urgent
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
