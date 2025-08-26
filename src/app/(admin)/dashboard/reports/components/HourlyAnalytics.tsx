"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HourlyStats {
    hour: string;
    bookings_count: number;
    revenue: number;
}

interface HourlyStatsProps {
    hourlyData: HourlyStats[];
}

export default function HourlyAnalytics({ hourlyData }: HourlyStatsProps) {
    // Find peak hour
    const peakHour = hourlyData.reduce(
        (peak, current) =>
            current.bookings_count > peak.bookings_count ? current : peak,
        hourlyData[0] || { hour: "", bookings_count: 0, revenue: 0 }
    );

    // Calculate max values for scaling
    const maxBookings = Math.max(...hourlyData.map((h) => h.bookings_count));
    const maxRevenue = Math.max(...hourlyData.map((h) => h.revenue));

    // Get hour performance level
    const getHourPerformance = (bookings: number) => {
        const ratio = bookings / maxBookings;
        if (ratio >= 0.8)
            return {
                level: "cao-diem",
                icon: "🔥",
                color: "text-red-600",
                bg: "bg-red-50",
            };
        if (ratio >= 0.6)
            return {
                level: "tot",
                icon: "⭐",
                color: "text-orange-600",
                bg: "bg-orange-50",
            };
        if (ratio >= 0.3)
            return {
                level: "trung-binh",
                icon: "✅",
                color: "text-blue-600",
                bg: "bg-blue-50",
            };
        return {
            level: "thap",
            icon: "💤",
            color: "text-gray-600",
            bg: "bg-gray-50",
        };
    };

    // Get time period label
    const getTimePeriod = (hour: string) => {
        const h = parseInt(hour.split(":")[0]);
        if (h >= 6 && h < 12) return "Sáng";
        if (h >= 12 && h < 18) return "Chiều";
        if (h >= 18 && h < 22) return "Tối";
        return "Đêm";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Thống kê theo giờ
                </CardTitle>
            </CardHeader>
            <CardContent>
                {hourlyData.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            Chưa có dữ liệu theo giờ
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Peak Hour Highlight */}
                        {peakHour.hour && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <Flame className="h-5 w-5 text-red-500" />
                                    <h4 className="font-semibold text-red-800">
                                        Giờ cao điểm
                                    </h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-bold text-red-700">
                                            {peakHour.hour} (
                                            {getTimePeriod(peakHour.hour)})
                                        </p>
                                        <p className="text-sm text-red-600">
                                            {peakHour.bookings_count} lượt đặt •{" "}
                                            {formatCurrency(peakHour.revenue)}
                                        </p>
                                    </div>
                                    <Star className="h-8 w-8 text-yellow-500" />
                                </div>
                            </div>
                        )}

                        {/* Hourly Data */}
                        <div className="space-y-3">
                            {hourlyData.map((hourStat) => {
                                const performance = getHourPerformance(
                                    hourStat.bookings_count
                                );
                                const bookingRatio =
                                    hourStat.bookings_count / maxBookings;
                                const revenueRatio =
                                    hourStat.revenue / maxRevenue;

                                return (
                                    <div
                                        key={hourStat.hour}
                                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${performance.bg}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-10 bg-white rounded-lg border flex items-center justify-center shadow-sm">
                                                    <span className="text-sm font-bold text-gray-700">
                                                        {hourStat.hour}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            hourStat.bookings_count
                                                        }{" "}
                                                        lượt đặt
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {getTimePeriod(
                                                            hourStat.hour
                                                        )}{" "}
                                                        •{" "}
                                                        {formatCurrency(
                                                            hourStat.revenue
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        performance.color
                                                    }
                                                >
                                                    {performance.icon}
                                                </Badge>
                                                {hourStat.hour ===
                                                    peakHour.hour && (
                                                    <Badge className="bg-red-100 text-red-700 border-red-300">
                                                        Cao điểm
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress Bars */}
                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Lượt đặt</span>
                                                    <span>
                                                        {(
                                                            bookingRatio * 100
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${
                                                                bookingRatio *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                    <span>Doanh thu</span>
                                                    <span>
                                                        {(
                                                            revenueRatio * 100
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${
                                                                revenueRatio *
                                                                100
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary by Time Periods */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4">
                                Tổng kết theo khung giờ
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {["Sáng", "Chiều", "Tối", "Đêm"].map(
                                    (period) => {
                                        const periodData = hourlyData.filter(
                                            (h) =>
                                                getTimePeriod(h.hour) === period
                                        );
                                        const totalBookings = periodData.reduce(
                                            (sum, h) => sum + h.bookings_count,
                                            0
                                        );
                                        const totalRevenue = periodData.reduce(
                                            (sum, h) => sum + h.revenue,
                                            0
                                        );

                                        return (
                                            <div
                                                key={period}
                                                className="text-center p-3 bg-gray-50 rounded-lg"
                                            >
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    {period}
                                                </p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {totalBookings}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatCurrency(
                                                        totalRevenue
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
