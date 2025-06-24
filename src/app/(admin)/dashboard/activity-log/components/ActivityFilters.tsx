// client/src/app/(admin)/dashboard/activity-log/components/ActivityFilters.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker"; // ✅ Import từ react-day-picker
import { Filter, RefreshCw, Download, Search } from "lucide-react";
import { ActivityLogFilters } from "../types/activityTypes";

interface ActivityFiltersProps {
    filters: ActivityLogFilters;
    onFiltersChange: (filters: ActivityLogFilters) => void;
    onRefresh: () => void;
    onExport: () => void;
    loading?: boolean;
}

export default function ActivityFilters({
    filters,
    onFiltersChange,
    onRefresh,
    onExport,
    loading = false,
}: ActivityFiltersProps) {
    const [search, setSearch] = useState(filters.search || "");

    // ✅ Sửa lỗi: Cập nhật type cho handleFilterChange
    const handleFilterChange = (
        key: keyof ActivityLogFilters,
        value: string | DateRange | undefined
    ) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        // Debounce search
        setTimeout(() => {
            onFiltersChange({
                ...filters,
                search: value,
            });
        }, 500);
    };

    const resetFilters = () => {
        setSearch("");
        onFiltersChange({});
    };

    // ✅ Convert function để transform DateRange sang DateRangeType
    const convertToDateRange = (
        dateRange: DateRange | undefined
    ): { from: Date; to: Date } | undefined => {
        if (!dateRange?.from || !dateRange?.to) return undefined;
        return {
            from: dateRange.from,
            to: dateRange.to,
        };
    };

    // ✅ Convert function để transform DateRangeType sang DateRange
    const convertFromDateRange = (
        dateRangeType: { from: Date; to: Date } | undefined
    ): DateRange | undefined => {
        if (!dateRangeType) return undefined;
        return {
            from: dateRangeType.from,
            to: dateRangeType.to,
        };
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Bộ lọc nhật ký hoạt động
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Tìm kiếm */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Tìm kiếm</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Tìm kiếm hoạt động..."
                                value={search}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Loại hoạt động */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Loại hoạt động</Label>
                        <Select
                            value={filters.type || "all"}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "type",
                                    value === "all" ? undefined : value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="booking">Đặt sân</SelectItem>
                                <SelectItem value="payment">
                                    Thanh toán
                                </SelectItem>
                                <SelectItem value="user">Người dùng</SelectItem>
                                <SelectItem value="maintenance">
                                    Bảo trì
                                </SelectItem>
                                <SelectItem value="system">Hệ thống</SelectItem>
                                <SelectItem value="event">Sự kiện</SelectItem>
                                <SelectItem value="news">Tin tức</SelectItem>
                                <SelectItem value="venue">Địa điểm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hành động */}
                    <div className="space-y-2">
                        <Label htmlFor="action">Hành động</Label>
                        <Select
                            value={filters.action || "all"}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "action",
                                    value === "all" ? undefined : value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="create">Tạo mới</SelectItem>
                                <SelectItem value="update">Cập nhật</SelectItem>
                                <SelectItem value="delete">Xóa</SelectItem>
                                <SelectItem value="login">Đăng nhập</SelectItem>
                                <SelectItem value="logout">
                                    Đăng xuất
                                </SelectItem>
                                <SelectItem value="approve">
                                    Phê duyệt
                                </SelectItem>
                                <SelectItem value="reject">Từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mức độ */}
                    <div className="space-y-2">
                        <Label htmlFor="severity">Mức độ</Label>
                        <Select
                            value={filters.severity || "all"}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "severity",
                                    value === "all" ? undefined : value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="low">Thấp</SelectItem>
                                <SelectItem value="medium">
                                    Trung bình
                                </SelectItem>
                                <SelectItem value="high">Cao</SelectItem>
                                <SelectItem value="critical">
                                    Nghiêm trọng
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Khoảng thời gian */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label>Khoảng thời gian</Label>
                        <DateRangePicker
                            // ✅ Sửa lỗi: Convert DateRangeType sang DateRange
                            value={convertFromDateRange(filters.dateRange)}
                            onChange={(dateRange) => {
                                // ✅ Convert DateRange sang DateRangeType và update
                                const converted = convertToDateRange(dateRange);
                                handleFilterChange("dateRange", converted);
                            }}
                            presets={[
                                {
                                    label: "Hôm nay",
                                    value: { from: new Date(), to: new Date() },
                                },
                                {
                                    label: "7 ngày qua",
                                    value: {
                                        from: new Date(
                                            Date.now() - 7 * 24 * 60 * 60 * 1000
                                        ),
                                        to: new Date(),
                                    },
                                },
                                {
                                    label: "30 ngày qua",
                                    value: {
                                        from: new Date(
                                            Date.now() -
                                                30 * 24 * 60 * 60 * 1000
                                        ),
                                        to: new Date(),
                                    },
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={onRefresh}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Làm mới
                    </Button>

                    <Button
                        onClick={onExport}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </Button>

                    <Button
                        onClick={resetFilters}
                        variant="ghost"
                        className="flex items-center gap-2"
                    >
                        Đặt lại bộ lọc
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
