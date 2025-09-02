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
    if (active && payload && payload.length) {
        const date = new Date(label || "");
        const formattedDate = date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

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
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Không có dữ liệu để hiển thị
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                            });
                        }}
                        className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#16a34a", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
