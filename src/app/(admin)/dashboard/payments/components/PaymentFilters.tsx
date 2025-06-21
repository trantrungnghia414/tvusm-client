// client/src/app/(admin)/dashboard/payments/components/PaymentFilters.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Filter,
    X,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
// import { Payment } from "../types/payment";

interface PaymentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    methodFilter: string;
    setMethodFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    dateFilter: Date | undefined;
    setDateFilter: (value: Date | undefined) => void;
    amountFilter: { min?: number; max?: number };
    setAmountFilter: (value: { min?: number; max?: number }) => void;
    onClearFilters: () => void;
    showAdvanced: boolean;
    setShowAdvanced: (value: boolean) => void;
}

const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "completed", label: "Thành công" },
    { value: "failed", label: "Thất bại" },
    { value: "refunded", label: "Đã hoàn tiền" },
    { value: "cancelled", label: "Đã hủy" },
];

const methodOptions = [
    { value: "all", label: "Tất cả phương thức" },
    { value: "cash", label: "Tiền mặt" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "vnpay", label: "VNPay" },
    { value: "momo", label: "MoMo" },
];

const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "booking", label: "Đặt sân" },
    { value: "rental", label: "Thuê thiết bị" },
];

export default function PaymentFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    methodFilter,
    setMethodFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    amountFilter,
    setAmountFilter,
    onClearFilters,
    showAdvanced,
    setShowAdvanced,
}: PaymentFiltersProps) {
    const activeFiltersCount = [
        statusFilter !== "all",
        methodFilter !== "all",
        typeFilter !== "all",
        dateFilter,
        amountFilter.min || amountFilter.max,
    ].filter(Boolean).length;

    return (
        <Card className="mb-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Bộ lọc
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? (
                                <ChevronUp className="h-4 w-4 mr-2" />
                            ) : (
                                <ChevronDown className="h-4 w-4 mr-2" />
                            )}
                            {showAdvanced ? "Thu gọn" : "Mở rộng"}
                        </Button>
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm theo mã GD, khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Payment Method Filter */}
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Phương thức" />
                        </SelectTrigger>
                        <SelectContent>
                            {methodOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Loại thanh toán" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Ngày thanh toán
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFilter ? (
                                                format(dateFilter, "dd/MM/yyyy", {
                                                    locale: vi,
                                                })
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateFilter}
                                            onSelect={setDateFilter}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Amount Range */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Số tiền từ (VNĐ)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={amountFilter.min || ""}
                                    onChange={(e) =>
                                        setAmountFilter({
                                            ...amountFilter,
                                            min: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Số tiền đến (VNĐ)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="999,999,999"
                                    value={amountFilter.max || ""}
                                    onChange={(e) =>
                                        setAmountFilter({
                                            ...amountFilter,
                                            max: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}