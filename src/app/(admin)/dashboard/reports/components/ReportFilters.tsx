// client/src/app/(admin)/dashboard/reports/components/ReportFilters.tsx
"use client";

import React, { useState } from "react";
import { Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
    ReportFilters as FilterType,
    ExportOptions,
    DateRangeType,
} from "../types/reportTypes";

interface ReportFiltersProps {
    filters: FilterType;
    onFiltersChange: (filters: FilterType) => void;
    onExport: (options: ExportOptions) => void;
    onRefresh: () => void;
    venues?: Array<{ venue_id: number; name: string }>;
    customers?: Array<{ user_id: number; full_name: string }>;
    loading?: boolean;
}

export default function ReportFilters({
    filters,
    onFiltersChange,
    onExport,
    onRefresh,
    venues = [],
    customers = [],
    loading = false,
}: ReportFiltersProps) {
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
        "pdf"
    );
    const [includeCharts, setIncludeCharts] = useState(true);

    const handleFilterChange = (
        key: keyof FilterType,
        value: string | number | undefined | DateRangeType
    ) => {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    };

    const handleExport = () => {
        onExport({
            format: exportFormat,
            includeCharts,
            dateRange: filters.dateRange,
            reportType: filters.reportType,
        });
        setExportDialogOpen(false);
    };

    const getDateRangePresets = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastQuarter = new Date(today);
        lastQuarter.setMonth(lastQuarter.getMonth() - 3);

        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        return [
            { label: "Hôm qua", value: { from: yesterday, to: yesterday } },
            { label: "7 ngày qua", value: { from: lastWeek, to: today } },
            { label: "30 ngày qua", value: { from: lastMonth, to: today } },
            { label: "3 tháng qua", value: { from: lastQuarter, to: today } },
            { label: "1 năm qua", value: { from: lastYear, to: today } },
        ];
    };

    const handleDateRangeChange = (dateRange: DateRange | undefined) => {
        if (!dateRange) {
            handleFilterChange("dateRange", undefined);
            return;
        }

        if (dateRange.from && dateRange.to) {
            const convertedRange: DateRangeType = {
                from: dateRange.from,
                to: dateRange.to,
            };
            handleFilterChange("dateRange", convertedRange);
        } else {
            handleFilterChange("dateRange", undefined);
        }
    };

    const convertToDateRange = (
        dateRangeType: DateRangeType | undefined
    ): DateRange | undefined => {
        if (!dateRangeType) return undefined;
        return {
            from: dateRangeType.from,
            to: dateRangeType.to,
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Bộ lọc báo cáo
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    {/* Report Type */}
                    <div className="space-y-2">
                        <Label htmlFor="reportType">Loại báo cáo</Label>
                        <Select
                            value={filters.reportType}
                            onValueChange={(value: FilterType["reportType"]) =>
                                handleFilterChange("reportType", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại báo cáo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">
                                    Doanh thu
                                </SelectItem>
                                <SelectItem value="customers">
                                    Khách hàng
                                </SelectItem>
                                <SelectItem value="venues">
                                    Sân thi đấu
                                </SelectItem>
                                <SelectItem value="bookings">
                                    Đặt sân
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Period */}
                    <div className="space-y-2">
                        <Label htmlFor="period">Chu kỳ</Label>
                        <Select
                            value={filters.period}
                            onValueChange={(value: FilterType["period"]) =>
                                handleFilterChange("period", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn chu kỳ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Theo ngày</SelectItem>
                                <SelectItem value="weekly">
                                    Theo tuần
                                </SelectItem>
                                <SelectItem value="monthly">
                                    Theo tháng
                                </SelectItem>
                                <SelectItem value="quarterly">
                                    Theo quý
                                </SelectItem>
                                <SelectItem value="yearly">Theo năm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Venue Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="venue">Địa điểm</Label>
                        <Select
                            value={filters.venueId?.toString() || "all"}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "venueId",
                                    value === "all"
                                        ? undefined
                                        : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả địa điểm" />
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

                    {/* Customer Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="customer">Khách hàng</Label>
                        <Select
                            value={filters.customerId?.toString() || "all"}
                            onValueChange={(value) =>
                                handleFilterChange(
                                    "customerId",
                                    value === "all"
                                        ? undefined
                                        : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả khách hàng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả khách hàng
                                </SelectItem>
                                {customers.map((customer) => (
                                    <SelectItem
                                        key={customer.user_id}
                                        value={customer.user_id.toString()}
                                    >
                                        {customer.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Khoảng thời gian</Label>
                        <DateRangePicker
                            value={convertToDateRange(filters.dateRange)}
                            onChange={handleDateRangeChange}
                            presets={getDateRangePresets()}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
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

                    <Popover
                        open={exportDialogOpen}
                        onOpenChange={setExportDialogOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Xuất báo cáo
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-4">
                                <h4 className="font-medium">
                                    Tùy chọn xuất báo cáo
                                </h4>

                                <div className="space-y-2">
                                    <Label>Định dạng</Label>
                                    <Select
                                        value={exportFormat}
                                        onValueChange={(
                                            value: "pdf" | "excel" | "csv"
                                        ) => setExportFormat(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">
                                                PDF
                                            </SelectItem>
                                            <SelectItem value="excel">
                                                Excel
                                            </SelectItem>
                                            <SelectItem value="csv">
                                                CSV
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="includeCharts"
                                        checked={includeCharts}
                                        onChange={(e) =>
                                            setIncludeCharts(e.target.checked)
                                        }
                                        className="rounded"
                                    />
                                    <Label htmlFor="includeCharts">
                                        Bao gồm biểu đồ
                                    </Label>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleExport}
                                        className="flex-1"
                                    >
                                        Xuất báo cáo
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setExportDialogOpen(false)
                                        }
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    );
}
