// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackFilters.tsx
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Filter,
    Search,
    CalendarIcon,
    RotateCcw,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FeedbackFilters as FilterType, VenueOption } from "../types/feedback";

interface FeedbackFiltersProps {
    filters: FilterType;
    onFiltersChange: (filters: FilterType) => void;
    venues: VenueOption[];
    onClearFilters: () => void;
}

export default function FeedbackFilters({
    filters,
    onFiltersChange,
    venues,
    onClearFilters,
}: FeedbackFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dateFromOpen, setDateFromOpen] = useState(false);
    const [dateToOpen, setDateToOpen] = useState(false);

    // ✅ Sửa lỗi: Thay 'any' bằng union type cụ thể
    const handleFilterChange = (
        key: keyof FilterType,
        value: string | Date | undefined
    ) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const hasActiveFilters = () => {
        return (
            filters.search ||
            filters.status !== "all" ||
            filters.rating !== "all" ||
            filters.venue !== "all" ||
            filters.dateFrom ||
            filters.dateTo
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters() && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Xóa lọc
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search - Always visible */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Tìm kiếm theo tên người dùng, nội dung phản hồi..."
                        value={filters.search}
                        onChange={(e) =>
                            handleFilterChange("search", e.target.value)
                        }
                        className="pl-10"
                    />
                </div>

                {/* Advanced Filters */}
                {isExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
                        {/* Status Filter */}
                        <div>
                            <Label htmlFor="status-filter">Trạng thái</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    handleFilterChange("status", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả trạng thái
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Chờ duyệt
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Đã duyệt
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Đã từ chối
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <Label htmlFor="rating-filter">Đánh giá</Label>
                            <Select
                                value={filters.rating}
                                onValueChange={(value) =>
                                    handleFilterChange("rating", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đánh giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả đánh giá
                                    </SelectItem>
                                    <SelectItem value="5">5 sao</SelectItem>
                                    <SelectItem value="4">4 sao</SelectItem>
                                    <SelectItem value="3">3 sao</SelectItem>
                                    <SelectItem value="2">2 sao</SelectItem>
                                    <SelectItem value="1">1 sao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Venue Filter */}
                        <div>
                            <Label htmlFor="venue-filter">Địa điểm</Label>
                            <Select
                                value={filters.venue}
                                onValueChange={(value) =>
                                    handleFilterChange("venue", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả địa điểm
                                    </SelectItem>
                                    {venues.map((venue) => (
                                        <SelectItem
                                            key={venue.venue_id}
                                            value={venue.venue_id.toString()}
                                        >
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div>
                            <Label>Từ ngày</Label>
                            <Popover
                                open={dateFromOpen}
                                onOpenChange={setDateFromOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateFrom ? (
                                            format(
                                                filters.dateFrom,
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateFrom}
                                        onSelect={(date) => {
                                            handleFilterChange(
                                                "dateFrom",
                                                date
                                            );
                                            setDateFromOpen(false);
                                        }}
                                        initialFocus
                                        locale={vi}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Date To */}
                        <div>
                            <Label>Đến ngày</Label>
                            <Popover
                                open={dateToOpen}
                                onOpenChange={setDateToOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateTo ? (
                                            format(
                                                filters.dateTo,
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateTo}
                                        onSelect={(date) => {
                                            handleFilterChange("dateTo", date);
                                            setDateToOpen(false);
                                        }}
                                        initialFocus
                                        locale={vi}
                                        disabled={(date) =>
                                            filters.dateFrom
                                                ? date < filters.dateFrom
                                                : false
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
