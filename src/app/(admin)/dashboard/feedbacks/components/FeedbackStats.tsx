// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackStats.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Star,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
} from "lucide-react";
import { FeedbackStats as FeedbackStatsType } from "../types/feedback";

interface FeedbackStatsProps {
    stats: FeedbackStatsType;
    loading?: boolean;
}

export default function FeedbackStats({
    stats,
    loading = false,
}: FeedbackStatsProps) {
    const statItems = [
        {
            title: "Tổng phản hồi",
            value: stats.total_feedbacks.toLocaleString(),
            icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
            bgColor: "bg-blue-50",
            change: `+${stats.this_month_count} tháng này`,
            changeColor: "text-green-600",
        },
        {
            title: "Đánh giá trung bình",
            value: `${stats.average_rating.toFixed(1)}/5`,
            icon: <Star className="h-8 w-8 text-yellow-500" />,
            bgColor: "bg-yellow-50",
            change: `${stats.five_star_count} đánh giá 5 sao`,
            changeColor: "text-yellow-600",
        },
        {
            title: "Chờ duyệt",
            value: stats.pending_count.toLocaleString(),
            icon: <Clock className="h-8 w-8 text-orange-500" />,
            bgColor: "bg-orange-50",
            change: `${(
                (stats.pending_count / stats.total_feedbacks) *
                100
            ).toFixed(1)}% tổng số`,
            changeColor: "text-orange-600",
        },
        {
            title: "Đã duyệt",
            value: stats.approved_count.toLocaleString(),
            icon: <CheckCircle className="h-8 w-8 text-green-600" />,
            bgColor: "bg-green-50",
            change: `${(
                (stats.approved_count / stats.total_feedbacks) *
                100
            ).toFixed(1)}% tổng số`,
            changeColor: "text-green-600",
        },
        {
            title: "Đã từ chối",
            value: stats.rejected_count.toLocaleString(),
            icon: <XCircle className="h-8 w-8 text-red-500" />,
            bgColor: "bg-red-50",
            change: `${(
                (stats.rejected_count / stats.total_feedbacks) *
                100
            ).toFixed(1)}% tổng số`,
            changeColor: "text-red-600",
        },
        {
            title: "Tỷ lệ phản hồi",
            value: `${stats.response_rate.toFixed(1)}%`,
            icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
            bgColor: "bg-purple-50",
            change:
                stats.response_rate > 80
                    ? "Tốt"
                    : stats.response_rate > 50
                    ? "Trung bình"
                    : "Cần cải thiện",
            changeColor:
                stats.response_rate > 80
                    ? "text-green-600"
                    : stats.response_rate > 50
                    ? "text-yellow-600"
                    : "text-red-600",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statItems.map((item, index) => (
                    <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {item.title}
                                </CardTitle>
                                <div
                                    className={`p-2 rounded-lg ${item.bgColor}`}
                                >
                                    {item.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {item.value}
                            </div>
                            <p className={`text-xs ${item.changeColor}`}>
                                {item.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Rating Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Phân bố đánh giá
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            { stars: 5, count: stats.five_star_count },
                            { stars: 4, count: stats.four_star_count },
                            { stars: 3, count: stats.three_star_count },
                            { stars: 2, count: stats.two_star_count },
                            { stars: 1, count: stats.one_star_count },
                        ].map((item) => {
                            const percentage =
                                stats.total_feedbacks > 0
                                    ? (item.count / stats.total_feedbacks) * 100
                                    : 0;

                            return (
                                <div
                                    key={item.stars}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium">
                                            {item.stars}
                                        </span>
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-sm text-gray-600 w-16 text-right">
                                        {item.count} ({percentage.toFixed(1)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
