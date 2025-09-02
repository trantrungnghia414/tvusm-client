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

interface BookingData {
    date: string;
    bookings: number;
}

interface BookingChartProps {
    data: BookingData[];
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
                <p className="text-sm font-semibold text-green-600">
                    Lượt đặt: {payload[0].value} lượt
                </p>
            </div>
        );
    }
    return null;
};

export default function BookingChart({ data }: BookingChartProps) {
    // Validation và filtering data
    const validData =
        data?.filter(
            (item) =>
                item &&
                typeof item.date === "string" &&
                typeof item.bookings === "number" &&
                !isNaN(item.bookings)
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
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
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
                        className="text-xs"
                        tickFormatter={(value) => {
                            const numValue = Number(value);
                            return isNaN(numValue) ? "0" : numValue.toString();
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#16a34a", strokeWidth: 2 }}
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
