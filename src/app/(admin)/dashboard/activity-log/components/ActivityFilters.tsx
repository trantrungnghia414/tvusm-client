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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ActivityLogFilters, DateRangeType } from "../types/activityTypes";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
    filters: ActivityLogFilters;
    onFiltersChange: (filters: ActivityLogFilters) => void;
    onRefresh: () => void;
    loading?: boolean;
}

export default function ActivityFilters({
    filters,
    onFiltersChange,
}: ActivityFiltersProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [specificDateOpen, setSpecificDateOpen] = useState(false);
    const [customRangeOpen, setCustomRangeOpen] = useState(false);

    // Determine current time range value
    const getTimeRangeValue = () => {
        if (filters.specificDate) return "specific";
        if (filters.customDateRange) return "custom";
        if (filters.dateRange) {
            const today = new Date();
            const startOfDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            );

            if (filters.dateRange.from.getTime() === startOfDay.getTime()) {
                return "today";
            } else if (
                Math.abs(
                    filters.dateRange.from.getTime() - sevenDaysAgo.getTime()
                ) <
                24 * 60 * 60 * 1000
            ) {
                return "7days";
            } else if (
                Math.abs(
                    filters.dateRange.from.getTime() - thirtyDaysAgo.getTime()
                ) <
                24 * 60 * 60 * 1000
            ) {
                return "30days";
            }
        }
        return "7days"; // default
    };

    const handleFilterChange = (
        key: keyof ActivityLogFilters,
        value: string | undefined
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
        setSpecificDateOpen(false);
        setCustomRangeOpen(false);
        onFiltersChange({
            dateRange: {
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                to: new Date(),
            },
        });
    };

    return (
        <Card className="mb-6">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Bộ lọc
                    </div>
                    <Button
                        onClick={resetFilters}
                        variant="ghost"
                        size="sm"
                        className="text-sm"
                    >
                        Đặt lại
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="-mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Tìm kiếm */}
                    <div className="space-y-2">
                        <Label htmlFor="search" className="text-sm font-medium">
                            Tìm kiếm
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="search"
                                placeholder="Tìm kiếm..."
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
                        <Label htmlFor="type" className="text-sm font-medium">
                            Loại hoạt động
                        </Label>
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
                                <SelectItem value="event">Sự kiện</SelectItem>
                                <SelectItem value="news">Tin tức</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Thời gian */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Thời gian</Label>
                        <Select
                            value={getTimeRangeValue()}
                            onValueChange={(value) => {
                                let dateRange;
                                const today = new Date();
                                const startOfDay = new Date(
                                    today.getFullYear(),
                                    today.getMonth(),
                                    today.getDate()
                                );
                                const endOfDay = new Date(
                                    today.getFullYear(),
                                    today.getMonth(),
                                    today.getDate(),
                                    23,
                                    59,
                                    59
                                );

                                switch (value) {
                                    case "today":
                                        dateRange = {
                                            from: startOfDay,
                                            to: endOfDay,
                                        };
                                        break;
                                    case "7days":
                                        dateRange = {
                                            from: new Date(
                                                Date.now() -
                                                    7 * 24 * 60 * 60 * 1000
                                            ),
                                            to: new Date(),
                                        };
                                        break;
                                    case "30days":
                                        dateRange = {
                                            from: new Date(
                                                Date.now() -
                                                    30 * 24 * 60 * 60 * 1000
                                            ),
                                            to: new Date(),
                                        };
                                        break;
                                    case "all":
                                    default:
                                        dateRange = undefined;
                                        break;
                                }
                                onFiltersChange({
                                    ...filters,
                                    dateRange,
                                    specificDate: undefined,
                                    customDateRange: undefined,
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="7 ngày qua" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả thời gian
                                </SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="7days">
                                    7 ngày qua
                                </SelectItem>
                                <SelectItem value="30days">
                                    30 ngày qua
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Chọn ngày cụ thể */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center justify-between">
                            Ngày cụ thể
                            {filters.specificDate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        onFiltersChange({
                                            ...filters,
                                            specificDate: undefined,
                                        });
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Label>
                        <Popover
                            open={specificDateOpen}
                            onOpenChange={setSpecificDateOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.specificDate &&
                                            "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.specificDate
                                        ? format(
                                              filters.specificDate,
                                              "dd/MM/yyyy"
                                          )
                                        : "Chọn ngày"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={filters.specificDate}
                                    onSelect={(date) => {
                                        onFiltersChange({
                                            ...filters,
                                            specificDate: date,
                                            dateRange: undefined,
                                            customDateRange: undefined,
                                        });
                                        setSpecificDateOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Khoảng thời gian tuỳ chỉnh */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center justify-between">
                            Khoảng tuỳ chỉnh
                            {filters.customDateRange && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        onFiltersChange({
                                            ...filters,
                                            customDateRange: undefined,
                                        });
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Label>
                        <Popover
                            open={customRangeOpen}
                            onOpenChange={setCustomRangeOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.customDateRange &&
                                            "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.customDateRange?.from ? (
                                        filters.customDateRange.to ? (
                                            <>
                                                {format(
                                                    filters.customDateRange
                                                        .from,
                                                    "dd/MM"
                                                )}{" "}
                                                -{" "}
                                                {format(
                                                    filters.customDateRange.to,
                                                    "dd/MM"
                                                )}
                                            </>
                                        ) : (
                                            format(
                                                filters.customDateRange.from,
                                                "dd/MM/yyyy"
                                            )
                                        )
                                    ) : (
                                        "Chọn khoảng"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    defaultMonth={filters.customDateRange?.from}
                                    selected={filters.customDateRange}
                                    onSelect={(range) => {
                                        if (range) {
                                            onFiltersChange({
                                                ...filters,
                                                customDateRange:
                                                    range as DateRangeType,
                                                dateRange: undefined,
                                                specificDate: undefined,
                                            });
                                            if (range.from && range.to) {
                                                setCustomRangeOpen(false);
                                            }
                                        }
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
