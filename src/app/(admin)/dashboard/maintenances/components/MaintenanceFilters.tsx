// client/src/app/(admin)/dashboard/maintenances/components/MaintenanceFilters.tsx
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
import type { VenueOption, UserOption } from "../types/maintenance";

interface MaintenanceFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    priorityFilter: string;
    setPriorityFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    venueFilter: string;
    setVenueFilter: (value: string) => void;
    assignedFilter: string;
    setAssignedFilter: (value: string) => void;
    dateFilter: Date | undefined;
    setDateFilter: (value: Date | undefined) => void;
    venues: VenueOption[];
    users: UserOption[];
    onClearFilters: () => void;
    showAdvanced: boolean;
    setShowAdvanced: (value: boolean) => void;
}

const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "scheduled", label: "Đã lên lịch" },
    { value: "in_progress", label: "Đang thực hiện" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "overdue", label: "Quá hạn" },
];

const priorityOptions = [
    { value: "all", label: "Tất cả mức độ" },
    { value: "low", label: "Thấp" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Cao" },
    { value: "critical", label: "Khẩn cấp" },
];

const typeOptions = [
    { value: "all", label: "Tất cả loại" },
    { value: "routine", label: "Định kỳ" },
    { value: "preventive", label: "Dự phòng" },
    { value: "corrective", label: "Sửa chữa" },
    { value: "emergency", label: "Khẩn cấp" },
    { value: "inspection", label: "Kiểm tra" },
];

export default function MaintenanceFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    venueFilter,
    setVenueFilter,
    assignedFilter,
    setAssignedFilter,
    dateFilter,
    setDateFilter,
    venues,
    users,
    onClearFilters,
    showAdvanced,
    setShowAdvanced,
}: MaintenanceFiltersProps) {
    const activeFiltersCount = [
        statusFilter !== "all",
        priorityFilter !== "all",
        typeFilter !== "all",
        venueFilter !== "all",
        assignedFilter !== "all",
        dateFilter,
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
                            placeholder="Tìm theo tiêu đề, mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Priority Filter */}
                    <Select
                        value={priorityFilter}
                        onValueChange={setPriorityFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Mức độ ưu tiên" />
                        </SelectTrigger>
                        <SelectContent>
                            {priorityOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Loại bảo trì" />
                        </SelectTrigger>
                        <SelectContent>
                            {typeOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
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
                            {/* Venue Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Địa điểm
                                </label>
                                <Select
                                    value={venueFilter}
                                    onValueChange={setVenueFilter}
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
                                                {venue.name} - {venue.location}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Assigned User Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Người phụ trách
                                </label>
                                <Select
                                    value={assignedFilter}
                                    onValueChange={setAssignedFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người phụ trách" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Tất cả
                                        </SelectItem>
                                        <SelectItem value="unassigned">
                                            Chưa phân công
                                        </SelectItem>
                                        {users.map((user) => (
                                            <SelectItem
                                                key={user.user_id}
                                                value={user.user_id.toString()}
                                            >
                                                {user.fullname || user.username}{" "}
                                                ({user.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Ngày lên lịch
                                </label>
                                <Popover>
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
                                                    {
                                                        locale: vi,
                                                    }
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
                                            onSelect={setDateFilter}
                                            initialFocus
                                            locale={vi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
