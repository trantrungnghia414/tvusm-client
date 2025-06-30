// client/src/app/(admin)/dashboard/bookings/components/BookingFilters.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    paymentStatusFilter: string;
    setPaymentStatusFilter: (value: string) => void;
    courtFilter: string;
    setCourtFilter: (value: string) => void;
    dateFilter: Date | undefined;
    setDateFilter: (date: Date | undefined) => void;
    courts: Array<{ court_id: number; name: string; type_name: string }>;
    onClearFilters: () => void;
    showAdvanced: boolean;
    setShowAdvanced: (show: boolean) => void;
}

export default function BookingFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    courtFilter,
    setCourtFilter,
    dateFilter,
    setDateFilter,
    courts,
    onClearFilters,
}: BookingFiltersProps) {
    const hasActiveFilters =
        searchTerm ||
        statusFilter !== "all" ||
        paymentStatusFilter !== "all" ||
        courtFilter !== "all" ||
        dateFilter;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            {/* Search Filter - Full Width */}
            <div className="mb-4">
                <Label
                    htmlFor="search"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                >
                    Tìm kiếm
                </Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="search"
                        type="text"
                        placeholder="Tìm theo tên khách hàng, email, mã đặt sân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setSearchTerm("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* All Other Filters in One Row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Status Filter */}
                <div className="w-full lg:w-1/5">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Trạng thái
                    </Label>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">
                                Chờ xác nhận
                            </SelectItem>
                            <SelectItem value="confirmed">
                                Đã xác nhận
                            </SelectItem>
                            <SelectItem value="completed">
                                Hoàn thành
                            </SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Payment Status Filter */}
                <div className="w-full lg:w-1/5">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Thanh toán
                    </Label>
                    <Select
                        value={paymentStatusFilter}
                        onValueChange={setPaymentStatusFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="pending">
                                Chưa thanh toán
                            </SelectItem>
                            <SelectItem value="paid">Đã thanh toán</SelectItem>
                            <SelectItem value="refunded">
                                Đã hoàn tiền
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Court Filter */}
                <div className="w-full lg:w-2/5">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Sân thể thao
                    </Label>
                    <Select value={courtFilter} onValueChange={setCourtFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn sân" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả sân</SelectItem>
                            {courts.map((court) => (
                                <SelectItem
                                    key={court.court_id}
                                    value={court.court_id.toString()}
                                >
                                    {court.name} ({court.type_name})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filter */}
                <div className="w-full lg:w-1/5">
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ngày đặt sân
                    </Label>
                    <div className="flex gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1 justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter ? (
                                        format(dateFilter, "dd/MM", {
                                            locale: vi,
                                        })
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
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Clear Date Button */}
                        {dateFilter && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDateFilter(undefined)}
                                className="flex-shrink-0"
                                title="Bỏ chọn ngày"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                    <span className="text-sm text-gray-500">
                        Bộ lọc đang áp dụng:
                    </span>
                    {searchTerm && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Tìm kiếm: &quot;{searchTerm}&quot;
                        </span>
                    )}
                    {statusFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Trạng thái: {statusFilter}
                        </span>
                    )}
                    {paymentStatusFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Thanh toán: {paymentStatusFilter}
                        </span>
                    )}
                    {courtFilter !== "all" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            Sân:{" "}
                            {
                                courts.find(
                                    (c) => c.court_id.toString() === courtFilter
                                )?.name
                            }
                        </span>
                    )}
                    {dateFilter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Ngày:{" "}
                            {format(dateFilter, "dd/MM/yyyy", { locale: vi })}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
