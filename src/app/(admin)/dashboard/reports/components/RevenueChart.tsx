"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
    date: string;
    revenue: number;
    bookings_count: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    // Calculate max values for scaling
    const maxRevenue = Math.max(...data.map((d) => d.revenue));
    const maxBookings = Math.max(...data.map((d) => d.bookings_count));

    // Chart config for styling
    const chartConfig = {
        revenue: {
            label: "Doanh thu",
            color: "hsl(var(--chart-1))",
        },
        bookings_count: {
            label: "Lượt đặt sân",
            color: "hsl(var(--chart-2))",
        },
    };

    // Format data for chart display
    const chartData = data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        }),
        formattedRevenue: formatCurrency(item.revenue),
    }));

    return (
        <div className="grid gap-6">
            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Biểu đồ doanh thu theo thời gian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                tickMargin={10}
                            />
                            <YAxis
                                fontSize={12}
                                tickFormatter={(value) =>
                                    `${(value / 1000000).toFixed(1)}M`
                                }
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => [
                                            name === "revenue"
                                                ? formatCurrency(Number(value))
                                                : `${value} lượt`,
                                            name === "revenue"
                                                ? "Doanh thu"
                                                : "Lượt đặt sân",
                                        ]}
                                    />
                                }
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                name="revenue"
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Bookings Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Biểu đồ lượt đặt sân theo thời gian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-80">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                tickMargin={10}
                            />
                            <YAxis fontSize={12} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => [
                                            `${value} lượt`,
                                            "Lượt đặt sân",
                                        ]}
                                    />
                                }
                            />
                            <Bar
                                dataKey="bookings_count"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                name="bookings_count"
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {data.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Thống kê tổng quan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-2">
                                    Doanh thu cao nhất
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(maxRevenue)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-2">
                                    Đặt sân nhiều nhất
                                </p>
                                <p className="text-xl font-bold text-blue-600">
                                    {maxBookings} lượt
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-2">
                                    Trung bình doanh thu/ngày
                                </p>
                                <p className="text-xl font-bold text-purple-600">
                                    {formatCurrency(
                                        data.reduce(
                                            (sum, d) => sum + d.revenue,
                                            0
                                        ) / data.length
                                    )}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-2">
                                    Tổng doanh thu ({data.length} ngày)
                                </p>
                                <p className="text-xl font-bold text-orange-600">
                                    {formatCurrency(
                                        data.reduce(
                                            (sum, d) => sum + d.revenue,
                                            0
                                        )
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
