"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ReportFiltersProps {
    reportPeriod: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    selectedCourtType: string;
    selectedVenue: string;
    selectedCourt: string; // Bỏ optional
    courtTypes: Array<{ type_id: number; name: string }>;
    venues: Array<{ venue_id: number; name: string }>;
    courts: Array<{ court_id: number; name: string; venue_id: number }>; // Bỏ optional
    onPeriodChange: (period: string) => void;
    onStartDateChange: (date: Date | undefined) => void;
    onEndDateChange: (date: Date | undefined) => void;
    onCourtTypeChange: (typeId: string) => void;
    onVenueChange: (venueId: string) => void;
    onCourtChange: (courtId: string) => void; // Bỏ optional
}

export default function ReportFilters({
    reportPeriod,
    startDate,
    endDate,
    selectedCourtType,
    selectedVenue,
    selectedCourt,
    courtTypes,
    venues,
    courts,
    onPeriodChange,
    onStartDateChange,
    onEndDateChange,
    onCourtTypeChange,
    onVenueChange,
    onCourtChange,
}: ReportFiltersProps) {
    // Lọc courts theo venue đã chọn
    const filteredCourts = React.useMemo(() => {
        if (!courts || courts.length === 0) return [];

        if (selectedVenue === "all") {
            return courts;
        }
        return courts.filter(
            (court) => court.venue_id.toString() === selectedVenue
        );
    }, [courts, selectedVenue]);

    // Reset court selection khi venue thay đổi
    React.useEffect(() => {
        if (selectedVenue !== "all" && selectedCourt !== "all") {
            const courtExists = filteredCourts.some(
                (court) => court.court_id.toString() === selectedCourt
            );
            if (!courtExists) {
                onCourtChange("all");
            }
        }
    }, [selectedVenue, selectedCourt, filteredCourts, onCourtChange]);

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Period Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Thời gian
                        </label>
                        <Select
                            value={reportPeriod}
                            onValueChange={onPeriodChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">7 ngày qua</SelectItem>
                                <SelectItem value="30d">30 ngày qua</SelectItem>
                                <SelectItem value="90d">90 ngày qua</SelectItem>
                                <SelectItem value="1y">Năm nay</SelectItem>
                                <SelectItem value="all">
                                    Toàn thời gian
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Từ ngày
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? (
                                        format(startDate, "dd/MM/yyyy", {
                                            locale: vi,
                                        })
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={onStartDateChange}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Đến ngày
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? (
                                        format(endDate, "dd/MM/yyyy", {
                                            locale: vi,
                                        })
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={onEndDateChange}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Court Type Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Loại sân
                        </label>
                        <Select
                            value={selectedCourtType}
                            onValueChange={onCourtTypeChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả loại sân" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả loại sân
                                </SelectItem>
                                {courtTypes.map((type) => (
                                    <SelectItem
                                        key={type.type_id}
                                        value={type.type_id.toString()}
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Venue Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Nhà thi đấu
                        </label>
                        <Select
                            value={selectedVenue}
                            onValueChange={onVenueChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả nhà thi đấu" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Tất cả nhà thi đấu
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

                    {/* Court Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Sân thể thao
                        </label>
                        <Select
                            value={selectedCourt}
                            onValueChange={onCourtChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tất cả sân" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả sân</SelectItem>
                                {filteredCourts.map((court) => (
                                    <SelectItem
                                        key={court.court_id}
                                        value={court.court_id.toString()}
                                    >
                                        {court.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
