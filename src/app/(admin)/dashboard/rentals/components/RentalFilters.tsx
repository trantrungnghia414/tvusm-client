// client/src/app/(admin)/dashboard/rentals/components/RentalFilters.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CalendarIcon, ChevronDown, ChevronUp, X } from "lucide-react";
import { Equipment } from "../types/rental";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RentalFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    paymentStatusFilter: string;
    setPaymentStatusFilter: (value: string) => void;
    equipmentFilter: string;
    setEquipmentFilter: (value: string) => void;
    dateFilter: Date | undefined;
    setDateFilter: (date: Date | undefined) => void;
    equipments: Equipment[];
    onClearFilters: () => void;
    showAdvanced: boolean;
    setShowAdvanced: (show: boolean) => void;
}

export default function RentalFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    equipmentFilter,
    setEquipmentFilter,
    dateFilter,
    setDateFilter,
    equipments,
    onClearFilters,
    showAdvanced,
    setShowAdvanced,
}: RentalFiltersProps) {
    const [dateOpen, setDateOpen] = React.useState(false);

    const hasActiveFilters =
        searchTerm !== "" ||
        statusFilter !== "all" ||
        paymentStatusFilter !== "all" ||
        equipmentFilter !== "all" ||
        dateFilter !== undefined;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Bộ lọc tìm kiếm</CardTitle>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Xóa bộ lọc
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    Ẩn bớt
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    Nâng cao
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div>
                    <Label htmlFor="search">Tìm kiếm</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            id="search"
                            placeholder="Tìm theo tên khách hàng, thiết bị, mã đơn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="status">Trạng thái</Label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả trạng thái" />
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
                                <SelectItem value="active">
                                    Đang thuê
                                </SelectItem>
                                <SelectItem value="returned">Đã trả</SelectItem>
                                <SelectItem value="cancelled">
                                    Đã hủy
                                </SelectItem>
                                <SelectItem value="overdue">Quá hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="payment">Thanh toán</Label>
                        <Select
                            value={paymentStatusFilter}
                            onValueChange={setPaymentStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả thanh toán" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả thanh toán
                                </SelectItem>
                                <SelectItem value="pending">
                                    Chưa thanh toán
                                </SelectItem>
                                <SelectItem value="paid">
                                    Đã thanh toán
                                </SelectItem>
                                <SelectItem value="refunded">
                                    Đã hoàn tiền
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="equipment">Thiết bị</Label>
                        <Select
                            value={equipmentFilter}
                            onValueChange={setEquipmentFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả thiết bị" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả thiết bị
                                </SelectItem>
                                {equipments.map((equipment) => (
                                    <SelectItem
                                        key={equipment.equipment_id}
                                        value={equipment.equipment_id.toString()}
                                    >
                                        {equipment.name} ({equipment.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Ngày bắt đầu thuê</Label>
                                <Popover
                                    open={dateOpen}
                                    onOpenChange={setDateOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFilter ? (
                                                format(
                                                    dateFilter,
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
                                            selected={dateFilter}
                                            onSelect={(date) => {
                                                setDateFilter(date);
                                                setDateOpen(false);
                                            }}
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Summary */}
                {hasActiveFilters && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {searchTerm && (
                                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    Tìm kiếm: &quot;{searchTerm}&quot;
                                </div>
                            )}
                            {statusFilter !== "all" && (
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                    Trạng thái: {getStatusLabel(statusFilter)}
                                </div>
                            )}
                            {paymentStatusFilter !== "all" && (
                                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                    Thanh toán:{" "}
                                    {getPaymentStatusLabel(paymentStatusFilter)}
                                </div>
                            )}
                            {equipmentFilter !== "all" && (
                                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                                    Thiết bị:{" "}
                                    {getEquipmentLabel(
                                        equipmentFilter,
                                        equipments
                                    )}
                                </div>
                            )}
                            {dateFilter && (
                                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                    Ngày:{" "}
                                    {format(dateFilter, "dd/MM/yyyy", {
                                        locale: vi,
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: "Chờ duyệt",
        approved: "Đã duyệt",
        active: "Đang thuê",
        returned: "Đã trả",
        cancelled: "Đã hủy",
        overdue: "Quá hạn",
    };
    return labels[status] || status;
}

function getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: "Chưa thanh toán",
        paid: "Đã thanh toán",
        refunded: "Đã hoàn tiền",
    };
    return labels[status] || status;
}

function getEquipmentLabel(
    equipmentId: string,
    equipments: Equipment[]
): string {
    const equipment = equipments.find(
        (eq) => eq.equipment_id.toString() === equipmentId
    );
    return equipment ? equipment.name : equipmentId;
}
