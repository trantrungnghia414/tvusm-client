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
import { Search, Calendar as CalendarIcon, X, Filter } from "lucide-react";
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
        <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm mb-6 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 border-b border-gray-200/60">
                <div className="flex items-center justify-between">
                    
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 my-2"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters Content */}
            <div className="p-6 space-y-6">
                {/* Search Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                        Tìm kiếm
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Tìm theo tên khách hàng, email, mã đặt sân..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
                                onClick={() => setSearchTerm("")}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Trạng thái
                        </Label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        Chờ xác nhận
                                    </div>
                                </SelectItem>
                                <SelectItem value="confirmed">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        Đã xác nhận
                                    </div>
                                </SelectItem>
                                <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Hoàn thành
                                    </div>
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        Đã hủy
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Thanh toán
                        </Label>
                        <Select
                            value={paymentStatusFilter}
                            onValueChange={setPaymentStatusFilter}
                        >
                            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Trạng thái thanh toán" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        Chưa thanh toán
                                    </div>
                                </SelectItem>
                                <SelectItem value="paid">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Đã thanh toán
                                    </div>
                                </SelectItem>
                                <SelectItem value="refunded">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        Đã hoàn tiền
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Court Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Sân thể thao
                        </Label>
                        <Select
                            value={courtFilter}
                            onValueChange={setCourtFilter}
                        >
                            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Chọn sân" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả sân</SelectItem>
                                {courts.map((court) => (
                                    <SelectItem
                                        key={court.court_id}
                                        value={court.court_id.toString()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                            {court.name} ({court.type_name})
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            Ngày đặt sân
                        </Label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-1 justify-start text-left font-normal h-11 border-gray-300 focus:border-blue-500 hover:bg-gray-50"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                        {dateFilter ? (
                                            <span className="text-gray-900">
                                                {format(
                                                    dateFilter,
                                                    "dd/MM/yyyy",
                                                    {
                                                        locale: vi,
                                                    }
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">
                                                Chọn ngày
                                            </span>
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
                                    className="flex-shrink-0 h-11 w-11 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                    title="Bỏ chọn ngày"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                    <div className="border-t border-gray-200/60 pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Bộ lọc đang áp dụng:
                            </span>
                            {searchTerm && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    <Search className="h-3 w-3" />
                                    &quot;{searchTerm}&quot;
                                </div>
                            )}
                            {statusFilter !== "all" && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    {statusFilter}
                                </div>
                            )}
                            {paymentStatusFilter !== "all" && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                    {paymentStatusFilter}
                                </div>
                            )}
                            {courtFilter !== "all" && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                    {
                                        courts.find(
                                            (c) =>
                                                c.court_id.toString() ===
                                                courtFilter
                                        )?.name
                                    }
                                </div>
                            )}
                            {dateFilter && (
                                <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(dateFilter, "dd/MM/yyyy", {
                                        locale: vi,
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
