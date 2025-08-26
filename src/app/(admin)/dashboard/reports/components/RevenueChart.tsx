"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Biểu đồ doanh thu theo thời gian
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80 bg-gray-50 rounded-lg p-6">
                    <div className="h-full flex flex-col">
                        {/* Chart placeholder - Có thể tích hợp Chart.js hoặc Recharts sau */}
                        <div className="flex-1 flex items-center justify-center mb-4">
                            <div className="text-center">
                                <p className="text-gray-500 mb-2">
                                    📈 Biểu đồ sẽ được hiển thị tại đây
                                </p>
                                <p className="text-sm text-gray-400">
                                    (Có thể tích hợp Chart.js hoặc Recharts)
                                </p>
                            </div>
                        </div>

                        {/* Quick stats from revenue data */}
                        {data.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-600 mb-1">
                                        Doanh thu cao nhất
                                    </p>
                                    <p className="font-bold text-green-600">
                                        {formatCurrency(maxRevenue)}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-600 mb-1">
                                        Đặt sân nhiều nhất
                                    </p>
                                    <p className="font-bold text-blue-600">
                                        {maxBookings} lượt
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-600 mb-1">
                                        Trung bình/ngày
                                    </p>
                                    <p className="font-bold text-purple-600">
                                        {formatCurrency(
                                            data.reduce(
                                                (sum, d) => sum + d.revenue,
                                                0
                                            ) / data.length
                                        )}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-600 mb-1">
                                        Tổng {data.length} ngày
                                    </p>
                                    <p className="font-bold text-orange-600">
                                        {formatCurrency(
                                            data.reduce(
                                                (sum, d) => sum + d.revenue,
                                                0
                                            )
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Simple bar chart visualization */}
                        {data.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Doanh thu 7 ngày gần nhất
                                </h4>
                                <div className="flex items-end gap-2 h-20">
                                    {data.slice(-7).map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 flex flex-col items-center"
                                        >
                                            <div
                                                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                                                style={{
                                                    height: `${
                                                        (item.revenue /
                                                            maxRevenue) *
                                                        100
                                                    }%`,
                                                    minHeight: "4px",
                                                }}
                                                title={`${formatCurrency(
                                                    item.revenue
                                                )} - ${
                                                    item.bookings_count
                                                } lượt`}
                                            />
                                            <span className="text-xs text-gray-500 mt-1">
                                                {item.date.slice(-2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
