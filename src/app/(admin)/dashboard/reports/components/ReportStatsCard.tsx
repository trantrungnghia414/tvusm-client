// client/src/app/(admin)/dashboard/reports/components/ReportStatsCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ReportStatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    description?: string;
    loading?: boolean;
}

export default function ReportStatsCard({
    title,
    value,
    icon: Icon,
    change,
    changeType = "neutral",
    description,
    loading = false,
}: ReportStatsCardProps) {
    const formatValue = (val: string | number): string => {
        if (typeof val === "number") {
            if (val >= 1000000) {
                return `${(val / 1000000).toFixed(1)}M`;
            }
            if (val >= 1000) {
                return `${(val / 1000).toFixed(1)}K`;
            }
            return val.toLocaleString();
        }
        return val;
    };

    const getChangeColor = () => {
        switch (changeType) {
            case "positive":
                return "text-green-600";
            case "negative":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </CardTitle>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatValue(value)}
                </div>
                {change && (
                    <p className={`text-xs ${getChangeColor()}`}>{change}</p>
                )}
                {description && (
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
