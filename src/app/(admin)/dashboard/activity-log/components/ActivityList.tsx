// client/src/app/(admin)/dashboard/activity-log/components/ActivityList.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLogItem } from "../types/activityTypes";
import ActivityItem from "./ActivityItem";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

interface ActivityListProps {
    activities: ActivityLogItem[];
    loading?: boolean;
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function ActivityList({
    activities,
    loading = false,
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
}: ActivityListProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (loading) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <List className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                            Không có hoạt động nào
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {totalItems} hoạt động
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Activity List - Compact */}
                <div className="space-y-1 mb-4">
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                </div>

                {/* Simple Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 px-3"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>

                        <span className="text-sm text-gray-600 min-w-0">
                            {currentPage} / {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
