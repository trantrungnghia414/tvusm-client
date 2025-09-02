"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CourtUsageData {
    court: {
        court_id: number;
        name: string;
        code: string;
        type_name?: string;
        venue_name?: string;
    };
    bookingCount: number;
    revenue: number;
    utilizationRate: number;
    averageBookingDuration: number;
}

interface CourtUsageChartProps {
    data: CourtUsageData[];
}

interface ChartData extends CourtUsageData {
    courtName: string;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: CourtUsageData;
        value: number;
        color: string;
    }>;
    label?: string;
}

export default function CourtUsageChart({ data }: CourtUsageChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Không có dữ liệu để hiển thị
            </div>
        );
    }

    // Sort data by booking count for better visualization
    const sortedData = [...data].sort(
        (a, b) => b.bookingCount - a.bookingCount
    );

    // Generate colors based on utilization rate
    const getBarColor = (utilizationRate: number) => {
        if (utilizationRate >= 80) return "#dc2626"; // High usage - red
        if (utilizationRate >= 60) return "#ea580c"; // Medium-high usage - orange
        if (utilizationRate >= 40) return "#ca8a04"; // Medium usage - yellow
        if (utilizationRate >= 20) return "#16a34a"; // Low-medium usage - green
        return "#6b7280"; // Very low usage - gray
    };

    const chartData: ChartData[] = sortedData.map((item) => ({
        ...item,
        courtName:
            item.court.name.length > 15
                ? `${item.court.name.substring(0, 15)}...`
                : item.court.name,
        color: getBarColor(item.utilizationRate),
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const courtData = payload[0].payload as CourtUsageData;

            return (
                <div className="bg-white p-4 border rounded-lg shadow-md min-w-64">
                    <h4 className="font-semibold text-gray-900 mb-2">
                        {courtData.court.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mã sân:</span>
                            <span className="font-medium">
                                {courtData.court.code}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Loại sân:</span>
                            <span className="font-medium">
                                {courtData.court.type_name || "N/A"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Địa điểm:</span>
                            <span className="font-medium">
                                {courtData.court.venue_name || "N/A"}
                            </span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between">
                            <span className="text-gray-600">Lượt đặt:</span>
                            <span className="font-semibold text-blue-600">
                                {courtData.bookingCount}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Doanh thu:</span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency(courtData.revenue)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">
                                Tỷ lệ sử dụng:
                            </span>
                            <span className="font-semibold text-orange-600">
                                {courtData.utilizationRate.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Thời gian TB:</span>
                            <span className="font-medium">
                                {courtData.averageBookingDuration.toFixed(1)}h
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>Sử dụng cao (≥80%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                    <span>Sử dụng khá (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span>Sử dụng TB (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Sử dụng thấp (20-39%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-600 rounded"></div>
                    <span>Sử dụng rất thấp (&lt;20%)</span>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            className="opacity-30"
                        />
                        <XAxis
                            dataKey="courtName"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                            className="text-xs"
                        />
                        <YAxis
                            className="text-xs"
                            tickFormatter={(value) => value.toString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="bookingCount" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {data.reduce(
                            (sum, court) => sum + court.bookingCount,
                            0
                        )}
                    </div>
                    <div className="text-sm text-gray-600">Tổng lượt đặt</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                            data.reduce((sum, court) => sum + court.revenue, 0)
                        )}
                    </div>
                    <div className="text-sm text-gray-600">Tổng doanh thu</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {(
                            data.reduce(
                                (sum, court) => sum + court.utilizationRate,
                                0
                            ) / data.length
                        ).toFixed(1)}
                        %
                    </div>
                    <div className="text-sm text-gray-600">
                        Tỷ lệ sử dụng TB
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {(
                            data.reduce(
                                (sum, court) =>
                                    sum + court.averageBookingDuration,
                                0
                            ) / data.length
                        ).toFixed(1)}
                        h
                    </div>
                    <div className="text-sm text-gray-600">
                        Thời gian đặt TB
                    </div>
                </div>
            </div>

            {/* Top and Bottom Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold mb-3 text-green-700">
                        Top 3 sân được sử dụng nhiều nhất
                    </h4>
                    <div className="space-y-2">
                        {sortedData.slice(0, 3).map((court, index) => (
                            <div
                                key={court.court.court_id}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-200 rounded-full text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {court.court.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {court.court.code}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">
                                        {court.bookingCount} lượt
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {court.utilizationRate.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-semibold mb-3 text-red-700">
                        Top 3 sân cần cải thiện
                    </h4>
                    <div className="space-y-2">
                        {sortedData
                            .slice(-3)
                            .reverse()
                            .map((court, index) => (
                                <div
                                    key={court.court.court_id}
                                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-red-200 rounded-full text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {court.court.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {court.court.code}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">
                                            {court.bookingCount} lượt
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {court.utilizationRate.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
