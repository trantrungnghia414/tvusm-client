"use client";

import React, { useState } from "react";
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VenuesFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

export default function VenuesFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
}: VenuesFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            placeholder="Tìm kiếm nhà thi đấu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3"
                        />
                    </div>
                </div>

                {/* Filter Toggle for Mobile */}
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Bộ lọc
                </Button>

                {/* Filters */}
                <div
                    className={`flex flex-col sm:flex-row gap-4 ${
                        showFilters ? "block" : "hidden lg:flex"
                    }`}
                >
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="active">
                                Đang hoạt động
                            </SelectItem>
                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                            <SelectItem value="inactive">Tạm dừng</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SortAsc className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Tên A-Z</SelectItem>
                            <SelectItem value="capacity">Sức chứa</SelectItem>
                            <SelectItem value="newest">Mới nhất</SelectItem>
                            <SelectItem value="popular">Phổ biến</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
