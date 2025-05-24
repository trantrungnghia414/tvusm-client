import React, { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Venue {
    venue_id: number;
    name: string;
}

interface EventFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    typeFilter: string;
    setTypeFilter: (value: string) => void;
    venueFilter: string;
    setVenueFilter: (value: string) => void;
    dateFilter: string;
    setDateFilter: (value: string) => void;
}

export default function EventFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    venueFilter,
    setVenueFilter,
    dateFilter,
    setDateFilter,
}: EventFiltersProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [activeFilters, setActiveFilters] = useState<number>(0);

    // Fetch danh sách các địa điểm
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                }
            } catch (error) {
                console.error("Error fetching venues:", error);
            }
        };

        fetchVenues();
    }, []);

    // Tính số filter đang áp dụng
    useEffect(() => {
        let count = 0;
        if (statusFilter !== "all") count++;
        if (typeFilter !== "all") count++;
        if (venueFilter !== "all") count++;
        if (dateFilter !== "all") count++;
        setActiveFilters(count);
    }, [statusFilter, typeFilter, venueFilter, dateFilter]);

    // Reset tất cả filter
    const handleResetFilters = () => {
        setStatusFilter("all");
        setTypeFilter("all");
        setVenueFilter("all");
        setDateFilter("all");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm sự kiện theo tên..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={activeFilters > 0 ? "secondary" : "outline"}
                        onClick={handleResetFilters}
                        disabled={activeFilters === 0}
                        className="whitespace-nowrap"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Bộ lọc
                        {activeFilters > 0 && (
                            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                                {activeFilters}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="upcoming">
                                Sắp diễn ra
                            </SelectItem>
                            <SelectItem value="ongoing">
                                Đang diễn ra
                            </SelectItem>
                            <SelectItem value="completed">
                                Đã hoàn thành
                            </SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Loại sự kiện</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả loại" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            <SelectItem value="competition">Thi đấu</SelectItem>
                            <SelectItem value="training">Tập luyện</SelectItem>
                            <SelectItem value="friendly">Giao lưu</SelectItem>
                            <SelectItem value="school_event">
                                Sự kiện trường
                            </SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Địa điểm</label>
                    <Select value={venueFilter} onValueChange={setVenueFilter}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả địa điểm" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả địa điểm</SelectItem>
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

                <div className="space-y-1">
                    <label className="text-sm font-medium">Thời gian</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả thời gian
                            </SelectItem>
                            <SelectItem value="today">Hôm nay</SelectItem>
                            <SelectItem value="this_week">Tuần này</SelectItem>
                            <SelectItem value="this_month">
                                Tháng này
                            </SelectItem>
                            <SelectItem value="future">Sắp tới</SelectItem>
                            <SelectItem value="past">Đã qua</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
