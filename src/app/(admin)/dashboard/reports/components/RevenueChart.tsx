"use client";

import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
    date: string;
    revenue: number;
}

interface RevenueChartProps {
    data: RevenueData[];
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        color: string;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length && label) {
        // Xử lý date string an toàn hơn
        let formattedDate = label;
        try {
            // Kiểm tra nếu label là date string hợp lệ
            if (typeof label === "string" && label.includes("-")) {
                const [year, month, day] = label.split("-");
                const date = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
                formattedDate = date.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
            }
        } catch (error) {
            console.warn("Error formatting date in tooltip:", error);
            // Fallback to original label
            formattedDate = label;
        }

        return (
            <div className="bg-white p-3 border rounded-lg shadow-md">
                <p className="text-sm text-gray-600">{formattedDate}</p>
                <p className="text-sm font-semibold text-blue-600">
                    Doanh thu: {formatCurrency(Number(payload[0].value))}
                </p>
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
    // Debug để kiểm tra dữ liệu
    if (data && data.length > 0) {
        console.log("RevenueChart data:", data);
        console.log(
            "Sample revenue value:",
            data[0]?.revenue,
            typeof data[0]?.revenue
        );
    }

    // Validation và filtering data
    const validData =
        data?.filter(
            (item) =>
                item &&
                typeof item.date === "string" &&
                typeof item.revenue === "number" &&
                !isNaN(item.revenue) &&
                item.revenue >= 0
        ) || [];

    if (validData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Không có dữ liệu để hiển thị
            </div>
        );
    }

    // Sort data by date to ensure correct order
    const sortedData = [...validData].sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart
                    data={sortedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            try {
                                // Xử lý date string an toàn hơn
                                if (
                                    typeof value === "string" &&
                                    value.includes("-")
                                ) {
                                    const [year, month, day] = value.split("-");
                                    const date = new Date(
                                        parseInt(year),
                                        parseInt(month) - 1,
                                        parseInt(day)
                                    );
                                    return date.toLocaleDateString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                    });
                                }
                                return value;
                            } catch (error) {
                                console.warn(
                                    "Error formatting date in XAxis:",
                                    error
                                );
                                return value;
                            }
                        }}
                        className="text-xs"
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tickFormatter={(value) => {
                            const numValue = Number(value);
                            if (isNaN(numValue)) return "0";

                            if (numValue >= 1000000) {
                                return `${(numValue / 1000000).toFixed(1)}M`;
                            } else if (numValue >= 1000) {
                                return `${(numValue / 1000).toFixed(0)}K`;
                            } else if (numValue === 0) {
                                return "0";
                            }
                            return new Intl.NumberFormat("vi-VN").format(
                                numValue
                            );
                        }}
                        className="text-xs"
                        domain={(() => {
                            // Kiểm tra nếu tất cả doanh thu đều bằng 0
                            const maxRevenue = Math.max(
                                ...sortedData.map((item) => item.revenue)
                            );
                            const minRevenue = Math.min(
                                ...sortedData.map((item) => item.revenue)
                            );

                            if (maxRevenue === 0 && minRevenue === 0) {
                                // Nếu tất cả doanh thu bằng 0, đặt domain từ 0 đến một giá trị nhỏ
                                return [0, 1000000]; // 1 triệu để có không gian hiển thị
                            }

                            // Trường hợp bình thường
                            return ["dataMin", "dataMax"];
                        })()}
                        allowDataOverflow={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
                        connectNulls={false}
                        isAnimationActive={true}
                        animationDuration={500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
