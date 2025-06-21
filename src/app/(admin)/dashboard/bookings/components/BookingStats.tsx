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

export default function BookingStats({
    stats,
    loading = false,
}: BookingStatsProps) {
    const statsCards = [
        {
            title: "Tổng đặt sân",
            value: stats.total_bookings,
            icon: <CalendarDays className="h-4 w-4" />,
            description: "Tất cả đặt sân",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: "+12% từ tháng trước",
        },
        {
            title: "Hôm nay",
            value: stats.today_bookings,
            icon: <Clock className="h-4 w-4" />,
            description: "Đặt sân hôm nay",
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: "+3 so với hôm qua",
        },
        {
            title: "Chờ xác nhận",
            value: stats.pending_bookings,
            icon: <Users className="h-4 w-4" />,
            description: "Cần xử lý",
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            urgent: stats.pending_bookings > 10,
        },
        {
            title: "Doanh thu tháng",
            value: formatCurrency(stats.monthly_revenue),
            icon: <DollarSign className="h-4 w-4" />,
            description: "Doanh thu tháng này",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            change: "+8% từ tháng trước",
        },
        {
            title: "Tỷ lệ hoàn thành",
            value: `${stats.completion_rate}%`,
            icon: <CheckCircle2 className="h-4 w-4" />,
            description: "Đặt sân hoàn thành",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            change: stats.completion_rate > 90 ? "Tuyệt vời!" : "Cần cải thiện",
        },
        {
            title: "Tổng doanh thu",
            value: formatCurrency(stats.total_revenue),
            icon: <TrendingUp className="h-4 w-4" />,
            description: "Tổng doanh thu",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            change: "+15% từ quý trước",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {statsCards.map((stat, index) => (
                <Card
                    key={index}
                    className="relative overflow-hidden hover:shadow-md transition-shadow"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                        </CardTitle>
                        <div
                            className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}
                        >
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2 mb-1">
                            <div className="text-2xl font-bold text-gray-900">
                                {stat.value}
                            </div>
                            {stat.urgent && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Urgent
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                            {stat.description}
                        </p>
                        {stat.change && (
                            <p
                                className={`text-xs ${
                                    stat.change.includes("+") ||
                                    stat.change.includes("Tuyệt vời")
                                        ? "text-green-600"
                                        : stat.change.includes("Cần cải thiện")
                                        ? "text-orange-600"
                                        : "text-gray-500"
                                }`}
                            >
                                {stat.change}
                            </p>
                        )}
                    </CardContent>

                    {/* Gradient overlay */}
                    <div
                        className={`absolute top-0 right-0 w-1 h-full ${stat.bgColor}`}
                    ></div>
                </Card>
            ))}
        </div>
    );
}
