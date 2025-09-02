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
    revenue: {
        total: number;
        growth: number;
        target?: number;
        achievement?: number;
    };
    bookings: {
        total: number;
        growth: number;
        avgValue: number;
    };
    customers: {
        total: number;
        active: number;
        new: number;
        retention: number;
    };
    courts: {
        totalCourts: number;
        avgUtilization: number;
        topPerformer: string;
    };
}

interface StatsCardsProps {
    stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
    const formatGrowth = (growth: number) => {
        const isPositive = growth >= 0;
        const Icon = isPositive ? TrendingUp : TrendingDown;
        const colorClass = isPositive ? "text-green-600" : "text-red-600";

        return (
            <div className={`flex items-center gap-1 ${colorClass}`}>
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                    {Math.abs(growth).toFixed(1)}%
                </span>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Tổng doanh thu
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(stats.revenue.total)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        {formatGrowth(stats.revenue.growth)}
                        <p className="text-xs text-muted-foreground">
                            so với kỳ trước
                        </p>
                    </div>
                    {stats.revenue.target && (
                        <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                                Mục tiêu: {formatCurrency(stats.revenue.target)}
                            </p>
                            {stats.revenue.achievement && (
                                <p className="text-xs font-medium">
                                    Đạt {stats.revenue.achievement.toFixed(1)}%
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bookings Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Lượt đặt sân
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.bookings.total.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        {formatGrowth(stats.bookings.growth)}
                        <p className="text-xs text-muted-foreground">
                            so với kỳ trước
                        </p>
                    </div>
                    <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            Giá trị TB:{" "}
                            {formatCurrency(stats.bookings.avgValue)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Customers Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Khách hàng
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.customers.total.toLocaleString()}
                    </div>
                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                                Hoạt động:
                            </span>
                            <span className="font-medium">
                                {stats.customers.active}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Mới:</span>
                            <span className="font-medium text-green-600">
                                +{stats.customers.new}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                                Giữ chân:
                            </span>
                            <span className="font-medium">
                                {stats.customers.retention.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Courts Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Sân thể thao
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.courts.totalCourts}
                    </div>
                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                                Sử dụng TB:
                            </span>
                            <span className="font-medium">
                                {stats.courts.avgUtilization.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                                Hàng đầu:
                            </span>
                            <span
                                className="font-medium text-blue-600 truncate"
                                title={stats.courts.topPerformer}
                            >
                                {stats.courts.topPerformer}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
