// file MetricCard được sử dụng để hiển thị các thông tin của người dùng trong bảng thống kê người dùng

import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: "up" | "down";
    description: string;
    icon: ReactNode;
    iconBg: string;
}

export default function MetricCard({
    title,
    value,
    change,
    trend,
    description,
    icon,
    iconBg,
}: MetricCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold mt-1">{value}</h3>
                        <div className="flex items-center mt-1">
                            <span
                                className={`text-xs font-medium ${
                                    trend === "up"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {change}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                                {description}
                            </span>
                        </div>
                    </div>
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                    >
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
