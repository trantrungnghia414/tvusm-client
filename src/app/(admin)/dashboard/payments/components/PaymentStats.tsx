// client/src/app/(admin)/dashboard/payments/components/PaymentStats.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Banknote,
    Smartphone,
} from "lucide-react";
// ✅ Sửa lỗi: Sử dụng type-only import
import type { PaymentStats } from "../types/payment";
import { formatCurrency } from "@/lib/utils";

interface PaymentStatsProps {
    stats: PaymentStats;
    loading?: boolean;
}

export default function PaymentStats({
    stats,
    loading = false,
}: PaymentStatsProps) {
    // ✅ Helper function để format currency an toàn
    const safeFormatCurrency = (amount: number | undefined | null) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0 ₫";
        }
        return formatCurrency(amount);
    };

    const statsData = [
        {
            title: "Tổng thu",
            value: safeFormatCurrency(stats.total_amount),
            amount: `${stats.total_payments || 0} giao dịch`,
            icon: <CreditCard className="h-4 w-4" />,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            change: `${stats.completed_payments || 0} thành công`,
        },
        {
            title: "Chờ xử lý",
            value: (stats.pending_payments || 0).toLocaleString(),
            amount: safeFormatCurrency(stats.pending_amount),
            icon: <Clock className="h-4 w-4" />,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            urgent: (stats.pending_payments || 0) > 10,
        },
        {
            title: "Thành công",
            value: (stats.completed_payments || 0).toLocaleString(),
            amount: safeFormatCurrency(stats.completed_amount),
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-green-600",
            bgColor: "bg-green-50",
            change: `${(
                ((stats.completed_payments || 0) /
                    (stats.total_payments || 1)) *
                100
            ).toFixed(1)}% tỷ lệ thành công`,
        },
        {
            title: "Thất bại",
            value: (stats.failed_payments || 0).toLocaleString(),
            amount: safeFormatCurrency(stats.refunded_amount),
            icon: <XCircle className="h-4 w-4" />,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Doanh thu hôm nay",
            value: safeFormatCurrency(stats.today_revenue),
            amount: `${(
                ((stats.today_revenue || 0) / (stats.monthly_revenue || 1)) *
                100
            ).toFixed(1)}% so với tháng`,
            icon: <TrendingUp className="h-4 w-4" />,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Doanh thu tháng",
            value: safeFormatCurrency(stats.monthly_revenue),
            amount: `${stats.total_payments || 0} giao dịch`,
            icon: <DollarSign className="h-4 w-4" />,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            change: "+12% từ tháng trước",
        },
        {
            title: "Tiền mặt",
            value: (stats.cash_payments || 0).toLocaleString(),
            amount: `${(
                ((stats.cash_payments || 0) / (stats.total_payments || 1)) *
                100
            ).toFixed(1)}% tổng giao dịch`,
            icon: <Banknote className="h-4 w-4" />,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Thanh toán online",
            value: (stats.online_payments || 0).toLocaleString(),
            amount: `${(
                ((stats.online_payments || 0) / (stats.total_payments || 1)) *
                100
            ).toFixed(1)}% tổng giao dịch`,
            icon: <Smartphone className="h-4 w-4" />,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
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
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {stat.title}
                            {stat.urgent && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Cần xử lý
                                </span>
                            )}
                        </CardTitle>
                        <div className={`p-2 ${stat.bgColor} rounded-md`}>
                            <div className={stat.color}>{stat.icon}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {stat.value}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            {stat.amount}
                        </p>
                        {stat.change && (
                            <p className="text-xs text-gray-500">
                                {stat.change}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
