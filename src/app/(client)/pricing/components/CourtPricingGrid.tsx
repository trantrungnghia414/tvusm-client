// client/src/app/(client)/pricing/components/CourtPricingGrid.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import CourtPricingCard from "./CourtPricingCard";
import { CourtPricing } from "../types/pricingTypes";

interface CourtPricingGridProps {
    courts: CourtPricing[];
    loading?: boolean;
}

export default function CourtPricingGrid({
    courts,
    loading = false,
}: CourtPricingGridProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort courts
    const filteredCourts = React.useMemo(() => {
        let result = [...courts];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (court) =>
                    court.name.toLowerCase().includes(searchLower) ||
                    court.type_name.toLowerCase().includes(searchLower) ||
                    court.venue_name.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter((court) => court.type_name === typeFilter);
        }

        // Location filter
        if (locationFilter !== "all") {
            if (locationFilter === "indoor") {
                result = result.filter((court) => court.is_indoor);
            } else if (locationFilter === "outdoor") {
                result = result.filter((court) => !court.is_indoor);
            }
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.hourly_rate - b.hourly_rate;
                case "price-high":
                    return b.hourly_rate - a.hourly_rate;
                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        return result;
    }, [courts, searchTerm, typeFilter, locationFilter, sortBy]);

    // Get unique types and venues
    const courtTypes = Array.from(
        new Set(courts.map((court) => court.type_name))
    );

    if (loading) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
                            >
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-20 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Bảng Giá Sân Thể Thao
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Khám phá các loại sân thể thao đa dạng với mức giá hợp
                        lý. Tất cả đều được trang bị cơ sở vật chất hiện đại.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm sân theo tên, loại sân..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Bộ lọc
                        </Button>

                        {/* Desktop Filters */}
                        <div className="hidden lg:flex gap-4">
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Loại sân" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả loại sân
                                    </SelectItem>
                                    {courtTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={locationFilter}
                                onValueChange={setLocationFilter}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Vị trí" />
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

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">
                                        Tên A-Z
                                    </SelectItem>
                                    <SelectItem value="price-low">
                                        Giá thấp → cao
                                    </SelectItem>
                                    <SelectItem value="price-high">
                                        Giá cao → thấp
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    {showFilters && (
                        <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 grid gap-4">
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Loại sân" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả loại sân
                                    </SelectItem>
                                    {courtTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={locationFilter}
                                onValueChange={setLocationFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Vị trí" />
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

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">
                                        Tên A-Z
                                    </SelectItem>
                                    <SelectItem value="price-low">
                                        Giá thấp → cao
                                    </SelectItem>
                                    <SelectItem value="price-high">
                                        Giá cao → thấp
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        Hiển thị {filteredCourts.length} trên {courts.length}{" "}
                        sân thể thao
                    </p>
                    {(searchTerm ||
                        typeFilter !== "all" ||
                        locationFilter !== "all") && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm("");
                                setTypeFilter("all");
                                setLocationFilter("all");
                                setSortBy("name");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                {/* Courts Grid */}
                {filteredCourts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourts.map((court) => (
                            <CourtPricingCard
                                key={court.court_id}
                                court={court}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Không tìm thấy sân nào
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Vui lòng thử lại với từ khóa hoặc bộ lọc khác
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setTypeFilter("all");
                                setLocationFilter("all");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
