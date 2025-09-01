// client/src/app/(admin)/dashboard/payments/components/PaymentFilters.tsx
"use client";

import React from "react";
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
import { Badge } from "@/components/ui/badge";
import {
    Filter,
    X,
    CalendarIcon,
    MapPin,
    Building2,
    Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CourtType {
    type_id: number;
    name: string;
    description?: string;
}

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    venue_name?: string;
    type_name?: string;
}

interface PaymentFiltersProps {
    // Main filters - new order
    dateFilter: Date | undefined;
    setDateFilter: (value: Date | undefined) => void;
    timeSlotFilter: string;
    setTimeSlotFilter: (value: string) => void;
    courtTypeFilter: string;
    setCourtTypeFilter: (value: string) => void;
    courtFilter: string;
    setCourtFilter: (value: string) => void;
    methodFilter: string;
    setMethodFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;

    // Data
    courtTypes: CourtType[];
    courts: Court[];
    onClearFilters: () => void;
}
export default function PaymentFilters({
    dateFilter,
    setDateFilter,
    timeSlotFilter,
    setTimeSlotFilter,
    courtTypeFilter,
    setCourtTypeFilter,
    courtFilter,
    setCourtFilter,
    methodFilter,
    setMethodFilter,
    statusFilter,
    setStatusFilter,
    courtTypes,
    courts,
    onClearFilters,
}: PaymentFiltersProps) {
    // Lọc sân theo loại sân đã chọn
    const filteredCourts =
        courtTypeFilter === "all"
            ? courts
            : courts.filter(
                  (court) => court.type_id.toString() === courtTypeFilter
              );

    const activeFiltersCount = [
        dateFilter,
        timeSlotFilter !== "all",
        courtTypeFilter !== "all",
        courtFilter !== "all",
        methodFilter !== "all",
        statusFilter !== "all",
    ].filter(Boolean).length;

    // Time slots chi tiết
    const timeSlots = [
        { value: "all", label: "Tất cả khung giờ" },
        { value: "06:00-07:00", label: "06:00 - 07:00" },
        { value: "07:00-08:00", label: "07:00 - 08:00" },
        { value: "08:00-09:00", label: "08:00 - 09:00" },
        { value: "09:00-10:00", label: "09:00 - 10:00" },
        { value: "10:00-11:00", label: "10:00 - 11:00" },
        { value: "11:00-12:00", label: "11:00 - 12:00" },
        { value: "12:00-13:00", label: "12:00 - 13:00" },
        { value: "13:00-14:00", label: "13:00 - 14:00" },
        { value: "14:00-15:00", label: "14:00 - 15:00" },
        { value: "15:00-16:00", label: "15:00 - 16:00" },
        { value: "16:00-17:00", label: "16:00 - 17:00" },
        { value: "17:00-18:00", label: "17:00 - 18:00" },
        { value: "18:00-19:00", label: "18:00 - 19:00" },
        { value: "19:00-20:00", label: "19:00 - 20:00" },
        { value: "20:00-21:00", label: "20:00 - 21:00" },
        { value: "21:00-22:00", label: "21:00 - 22:00" },
    ];

    // Payment methods (chỉ tiền mặt và chuyển khoản)
    const paymentMethods = [
        { value: "all", label: "Tất cả phương thức" },
        { value: "cash", label: "Tiền mặt" },
        { value: "bank_transfer", label: "Chuyển khoản" },
    ];

    // Payment statuses (chỉ chờ, hoàn thành và thất bại)
    const paymentStatuses = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "pending", label: "Chờ xử lý" },
        { value: "completed", label: "Hoàn thành" },
        { value: "failed", label: "Thất bại" },
    ];

    // Reset court filter khi thay đổi court type
    const handleCourtTypeChange = (value: string) => {
        setCourtTypeFilter(value);
        if (value === "all") {
            setCourtFilter("all");
        } else {
            const currentCourtValid = filteredCourts.some(
                (court) => court.court_id.toString() === courtFilter
            );
            if (!currentCourtValid) {
                setCourtFilter("all");
            }
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Bộ lọc thanh toán
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    Lọc thanh toán để cập nhật trạng thái theo thời gian và sân
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 6 Filters in one row */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* 1. Date Filter */}
                    <div className="space-y-2">
                        <Label>1. Ngày chơi</Label>
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
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={dateFilter}
                                    onSelect={setDateFilter}
                                    disabled={(date) =>
                                        date < new Date("2024-01-01")
                                    }
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 2. Time Slot Filter */}
                    <div className="space-y-2">
                        <Label>2. Khung giờ</Label>
                        <Select
                            value={timeSlotFilter}
                            onValueChange={setTimeSlotFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn giờ" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (
                                    <SelectItem
                                        key={slot.value}
                                        value={slot.value}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {slot.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. Court Type Filter */}
                    <div className="space-y-2">
                        <Label>3. Loại sân</Label>
                        <Select
                            value={courtTypeFilter}
                            onValueChange={handleCourtTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Loại sân" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Tất cả
                                    </div>
                                </SelectItem>
                                {courtTypes.map((courtType) => (
                                    <SelectItem
                                        key={courtType.type_id}
                                        value={courtType.type_id.toString()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-blue-500" />
                                            {courtType.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 4. Court Filter */}
                    <div className="space-y-2">
                        <Label>4. Sân cụ thể</Label>
                        <Select
                            value={courtFilter}
                            onValueChange={setCourtFilter}
                            disabled={courtTypeFilter === "all"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn sân" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Tất cả
                                    </div>
                                </SelectItem>
                                {filteredCourts.map((court) => (
                                    <SelectItem
                                        key={court.court_id}
                                        value={court.court_id.toString()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-green-500" />
                                            {court.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 5. Payment Method Filter */}
                    <div className="space-y-2">
                        <Label>5. Phương thức</Label>
                        <Select
                            value={methodFilter}
                            onValueChange={setMethodFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Phương thức" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem
                                        key={method.value}
                                        value={method.value}
                                    >
                                        {method.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 6. Status Filter */}
                    <div className="space-y-2">
                        <Label>6. Trạng thái</Label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentStatuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                    <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                                Bộ lọc đang áp dụng:
                            </Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-red-600 hover:text-red-700"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Xóa tất cả
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {dateFilter && (
                                <Badge variant="outline" className="gap-1">
                                    <CalendarIcon className="h-3 w-3" />
                                    Ngày:{" "}
                                    {format(dateFilter, "dd/MM/yyyy", {
                                        locale: vi,
                                    })}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => setDateFilter(undefined)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {timeSlotFilter !== "all" && (
                                <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" />
                                    Giờ:{" "}
                                    {
                                        timeSlots.find(
                                            (slot) =>
                                                slot.value === timeSlotFilter
                                        )?.label
                                    }
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => setTimeSlotFilter("all")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {courtTypeFilter !== "all" && (
                                <Badge variant="outline" className="gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Loại:{" "}
                                    {
                                        courtTypes.find(
                                            (ct) =>
                                                ct.type_id.toString() ===
                                                courtTypeFilter
                                        )?.name
                                    }
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() =>
                                            setCourtTypeFilter("all")
                                        }
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {courtFilter !== "all" && (
                                <Badge variant="outline" className="gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Sân:{" "}
                                    {
                                        courts.find(
                                            (c) =>
                                                c.court_id.toString() ===
                                                courtFilter
                                        )?.name
                                    }
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => setCourtFilter("all")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {methodFilter !== "all" && (
                                <Badge variant="outline" className="gap-1">
                                    Phương thức:{" "}
                                    {
                                        paymentMethods.find(
                                            (m) => m.value === methodFilter
                                        )?.label
                                    }
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => setMethodFilter("all")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {statusFilter !== "all" && (
                                <Badge variant="outline" className="gap-1">
                                    Trạng thái:{" "}
                                    {
                                        paymentStatuses.find(
                                            (s) => s.value === statusFilter
                                        )?.label
                                    }
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 ml-1"
                                        onClick={() => setStatusFilter("all")}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
