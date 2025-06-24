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
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không có hoạt động nào
                        </h3>
                        <p className="text-gray-500">
                            Không tìm thấy hoạt động nào với bộ lọc hiện tại.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List className="h-5 w-5" />
                        Nhật ký hoạt động
                    </div>
                    <div className="text-sm text-gray-500">
                        Hiển thị {startItem}-{endItem} trong tổng số{" "}
                        {totalItems} hoạt động
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Activity List */}
                <div className="space-y-4 mb-6">
                    {activities.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Trước
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(Math.min(5, totalPages))].map(
                                    (_, index) => {
                                        const pageNumber =
                                            currentPage <= 3
                                                ? index + 1
                                                : currentPage + index - 2;

                                        if (pageNumber > totalPages)
                                            return null;

                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={
                                                    pageNumber === currentPage
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    onPageChange(pageNumber)
                                                }
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Sau
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <div className="text-sm text-gray-500">
                            Trang {currentPage} / {totalPages}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
