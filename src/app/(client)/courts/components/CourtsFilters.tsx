"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

// Định nghĩa interfaces cho các dữ liệu từ API
interface CourtType {
    type_id: number;
    name: string;
}

interface Venue {
    venue_id: number;
    name: string;
}

interface CourtsFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    typeFilter: string;
    setTypeFilter: (type: string) => void;
    venueFilter: string;
    setVenueFilter: (venue: string) => void;
    indoorFilter: string;
    setIndoorFilter: (indoor: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export default function CourtsFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    venueFilter,
    setVenueFilter,
    indoorFilter,
    setIndoorFilter,
    sortBy,
    setSortBy,
}: CourtsFiltersProps) {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // State cho dữ liệu động từ API
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState({
        types: false,
        venues: false,
    });
    const [error, setError] = useState({
        types: false,
        venues: false,
    });

    // Fetch dữ liệu từ API khi component mount
    useEffect(() => {
        const fetchFilterData = async () => {
            // Fetch loại sân
            setLoading((prev) => ({ ...prev, types: true }));
            try {
                const response = await fetchApi("/court-types");
                if (response.ok) {
                    const data = await response.json();
                    setCourtTypes(data);
                } else {
                    setError((prev) => ({ ...prev, types: true }));
                    console.error("Failed to fetch court types");
                }
            } catch (err) {
                setError((prev) => ({ ...prev, types: true }));
                console.error("Error fetching court types:", err);
            } finally {
                setLoading((prev) => ({ ...prev, types: false }));
            }

            // Fetch nhà thi đấu
            setLoading((prev) => ({ ...prev, venues: true }));
            try {
                const response = await fetchApi("/venues");
                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                } else {
                    setError((prev) => ({ ...prev, venues: true }));
                    console.error("Failed to fetch venues");
                }
            } catch (err) {
                setError((prev) => ({ ...prev, venues: true }));
                console.error("Error fetching venues:", err);
            } finally {
                setLoading((prev) => ({ ...prev, venues: false }));
            }
        };

        fetchFilterData();
    }, []);

    // Đếm số bộ lọc đang hoạt động
    useEffect(() => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter !== "all") count++;
        if (typeFilter !== "all") count++;
        if (venueFilter !== "all") count++;
        if (indoorFilter !== "all") count++;
        if (sortBy !== "name") count++;
        setActiveFiltersCount(count);
    }, [
        searchTerm,
        statusFilter,
        typeFilter,
        venueFilter,
        indoorFilter,
        sortBy,
    ]);

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setTypeFilter("all");
        setVenueFilter("all");
        setIndoorFilter("all");
        setSortBy("name");
        setShowAdvancedFilters(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm sân theo tên, mã sân, địa điểm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() =>
                            setShowAdvancedFilters(!showAdvancedFilters)
                        }
                        className="flex items-center gap-2"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Bộ lọc nâng cao
                        {activeFiltersCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>

                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="h-4 w-4" />
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-4 border-t border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="available">
                                    Khả dụng
                                </SelectItem>
                                <SelectItem value="booked">Đã đặt</SelectItem>
                                <SelectItem value="maintenance">
                                    Bảo trì
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại sân
                        </label>
                        <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                            disabled={loading.types}
                        >
                            <SelectTrigger>
                                {loading.types ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Chọn loại sân" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {error.types ? (
                                    <SelectItem value="error" disabled>
                                        Lỗi tải dữ liệu
                                    </SelectItem>
                                ) : courtTypes.length > 0 ? (
                                    courtTypes.map((type) => (
                                        <SelectItem
                                            key={type.type_id}
                                            value={type.type_id.toString()}
                                        >
                                            {type.name}
                                        </SelectItem>
                                    ))
                                ) : !loading.types ? (
                                    <SelectItem value="empty" disabled>
                                        Không có dữ liệu
                                    </SelectItem>
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa điểm
                        </label>
                        <Select
                            value={venueFilter}
                            onValueChange={setVenueFilter}
                            disabled={loading.venues}
                        >
                            <SelectTrigger>
                                {loading.venues ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        <span>Đang tải...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Chọn địa điểm" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {error.venues ? (
                                    <SelectItem value="error" disabled>
                                        Lỗi tải dữ liệu
                                    </SelectItem>
                                ) : venues.length > 0 ? (
                                    venues.map((venue) => (
                                        <SelectItem
                                            key={venue.venue_id}
                                            value={venue.venue_id.toString()}
                                        >
                                            {venue.name}
                                        </SelectItem>
                                    ))
                                ) : !loading.venues ? (
                                    <SelectItem value="empty" disabled>
                                        Không có dữ liệu
                                    </SelectItem>
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vị trí
                        </label>
                        <Select
                            value={indoorFilter}
                            onValueChange={setIndoorFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vị trí" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="indoor">
                                    Trong nhà
                                </SelectItem>
                                <SelectItem value="outdoor">
                                    Ngoài trời
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sắp xếp theo
                        </label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sắp xếp" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Tên sân</SelectItem>
                                <SelectItem value="rate_asc">
                                    Giá thấp đến cao
                                </SelectItem>
                                <SelectItem value="rate_desc">
                                    Giá cao đến thấp
                                </SelectItem>
                                <SelectItem value="popular">
                                    Phổ biến nhất
                                </SelectItem>
                                <SelectItem value="newest">Mới nhất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={() => setShowAdvancedFilters(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
