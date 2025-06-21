// client/src/app/(admin)/dashboard/rentals/components/RentalStats.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    ShoppingBag,
    Clock,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Activity,
} from "lucide-react";
import { RentalStats as RentalStatsType } from "../types/rental";
import { formatCurrency } from "@/lib/utils";

interface RentalStatsProps {
    stats: RentalStatsType;
    loading: boolean;
}

export default function RentalStats({ stats, loading }: RentalStatsProps) {
    const statsData = [
        {
            title: "Tổng đơn thuê",
            value: stats.total_rentals,
            icon: ShoppingBag,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            change: "+12%",
            changeType: "increase",
        },
        {
            title: "Đang hoạt động",
            value: stats.active_rentals,
            icon: Activity,
            color: "text-green-600",
            bgColor: "bg-green-100",
            change: "+8%",
            changeType: "increase",
        },
        {
            title: "Chờ duyệt",
            value: stats.pending_rentals,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
            change: "+5%",
            changeType: "increase",
        },
        {
            title: "Quá hạn",
            value: stats.overdue_rentals,
            icon: AlertTriangle,
            color: "text-red-600",
            bgColor: "bg-red-100",
            change: "-2%",
            changeType: "decrease",
        },
        {
            title: "Doanh thu tháng",
            value: formatCurrency(stats.monthly_revenue),
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            change: "+15%",
            changeType: "increase",
            isAmount: true,
        },
        {
            title: "Tỷ lệ sử dụng TB",
            value: `${stats.equipment_utilization}%`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            change: "+3%",
            changeType: "increase",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                                </div>
                                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-600">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.isAmount
                                            ? stat.value
                                            : typeof stat.value === "number"
                                            ? stat.value.toLocaleString()
                                            : stat.value}
                                    </p>
                                    <div className="flex items-center text-xs">
                                        <span
                                            className={`${
                                                stat.changeType === "increase"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {stat.change}
                                        </span>
                                        <span className="text-gray-500 ml-1">
                                            từ tháng trước
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={`${stat.bgColor} p-3 rounded-full`}
                                >
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
