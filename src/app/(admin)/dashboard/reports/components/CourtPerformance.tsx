"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CourtRevenue {
    court_id: number;
    court_name: string;
    court_type: string;
    venue_name: string;
    total_bookings: number;
    total_revenue: number;
    utilization_rate: number;
    avg_booking_value: number;
}

interface CourtPerformanceProps {
    courts: CourtRevenue[];
    onViewCourt?: (courtId: number) => void;
}

export default function CourtPerformance({
    courts,
    onViewCourt,
}: CourtPerformanceProps) {
    // Get performance status
    const getPerformanceStatus = (utilizationRate: number) => {
        if (utilizationRate >= 80)
            return {
                label: "Xuất sắc",
                color: "bg-green-100 text-green-800",
                icon: "🔥",
            };
        if (utilizationRate >= 60)
            return {
                label: "Tốt",
                color: "bg-blue-100 text-blue-800",
                icon: "✅",
            };
        if (utilizationRate >= 40)
            return {
                label: "Trung bình",
                color: "bg-yellow-100 text-yellow-800",
                icon: "⚡",
            };
        return {
            label: "Cần cải thiện",
            color: "bg-red-100 text-red-800",
            icon: "⚠️",
        };
    };

    // Get utilization bar color
    const getUtilizationColor = (rate: number) => {
        if (rate >= 80) return "bg-green-500";
        if (rate >= 60) return "bg-blue-500";
        if (rate >= 40) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hiệu suất sân
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {courts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Chưa có dữ liệu hiệu suất sân
                            </p>
                        </div>
                    ) : (
                        courts.map((court) => {
                            const status = getPerformanceStatus(
                                court.utilization_rate
                            );
                            return (
                                <div
                                    key={court.court_id}
                                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() =>
                                        onViewCourt?.(court.court_id)
                                    }
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    {court.court_name}
                                                </h4>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {court.court_type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <MapPin className="h-3 w-3" />
                                                <span>{court.venue_name}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600 text-lg">
                                                {formatCurrency(
                                                    court.total_revenue
                                                )}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {court.total_bookings} lượt
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Utilization Rate */}
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Tỷ lệ sử dụng
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold">
                                                    {court.utilization_rate.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                                <Badge className={status.color}>
                                                    {status.icon} {status.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${getUtilizationColor(
                                                    court.utilization_rate
                                                )}`}
                                                style={{
                                                    width: `${Math.min(
                                                        court.utilization_rate,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded border">
                                            <p className="text-gray-600 mb-1">
                                                TB/lần đặt
                                            </p>
                                            <p className="font-semibold text-blue-600">
                                                {formatCurrency(
                                                    court.avg_booking_value
                                                )}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <p className="text-gray-600 mb-1">
                                                Doanh thu/ngày
                                            </p>
                                            <p className="font-semibold text-purple-600">
                                                {formatCurrency(
                                                    court.total_revenue / 30
                                                )}
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded border md:col-span-1 col-span-2">
                                            <p className="text-gray-600 mb-1">
                                                Hiệu suất
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                <span className="font-semibold text-green-600">
                                                    {court.utilization_rate > 70
                                                        ? "Cao"
                                                        : court.utilization_rate >
                                                          50
                                                        ? "Trung bình"
                                                        : "Thấp"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {courts.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng sân
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                    {courts.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng đặt sân
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                    {courts.reduce(
                                        (sum, c) => sum + c.total_bookings,
                                        0
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Tổng doanh thu
                                </p>
                                <p className="text-lg font-bold text-purple-600">
                                    {formatCurrency(
                                        courts.reduce(
                                            (sum, c) => sum + c.total_revenue,
                                            0
                                        )
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    TB sử dụng
                                </p>
                                <p className="text-lg font-bold text-orange-600">
                                    {(
                                        courts.reduce(
                                            (sum, c) =>
                                                sum + c.utilization_rate,
                                            0
                                        ) / courts.length
                                    ).toFixed(1)}
                                    %
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
