// client/src/app/(admin)/dashboard/reports/components/ReportChart.tsx
"use client";

import React from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataPoint } from "../types/reportTypes";

interface ReportChartProps {
    title: string;
    data: ChartDataPoint[];
    type: "area" | "bar" | "line" | "pie";
    height?: number;
    color?: string;
    loading?: boolean;
    description?: string;
}

const COLORS = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#8B5CF6", // violet-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
    "#84CC16", // lime-500
];

export default function ReportChart({
    title,
    data,
    type,
    height = 300,
    color = "#3B82F6",
    loading = false,
    description,
}: ReportChartProps) {
    const formatValue = (value: number): string => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toLocaleString();
    };

    // ✅ Sửa lỗi: Thay đổi return type và thêm fallback
    const renderChart = (): React.ReactElement => {
        switch (type) {
            case "area":
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={formatValue}
                        />
                        <Tooltip
                            formatter={(value: number) => [
                                formatValue(value),
                                "Giá trị",
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.1}
                            strokeWidth={2}
                        />
                    </AreaChart>
                );

            case "bar":
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={formatValue}
                        />
                        <Tooltip
                            formatter={(value: number) => [
                                formatValue(value),
                                "Giá trị",
                            ]}
                        />
                        <Bar
                            dataKey="value"
                            fill={color}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={formatValue}
                        />
                        <Tooltip
                            formatter={(value: number) => [
                                formatValue(value),
                                "Giá trị",
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        />
                    </LineChart>
                );

            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.color ||
                                        COLORS[index % COLORS.length]
                                    }
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => formatValue(value)}
                        />
                    </PieChart>
                );

            default:
                // ✅ Sửa lỗi: Thay vì return null, return một chart mặc định
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-gray-400 mb-2">
                                <svg
                                    className="h-12 w-12 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                                Loại biểu đồ không được hỗ trợ
                            </p>
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="bg-gray-200 rounded animate-pulse"
                        style={{ height }}
                    ></div>
                </CardContent>
            </Card>
        );
    }

    // ✅ Sửa lỗi: Kiểm tra dữ liệu trước khi render
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                        {title}
                    </CardTitle>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">
                            {description}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <div
                        className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg"
                        style={{ height }}
                    >
                        <div className="text-center">
                            <div className="text-gray-400 mb-2">
                                <svg
                                    className="h-12 w-12 mx-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500">
                                Không có dữ liệu để hiển thị
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    {title}
                </CardTitle>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
