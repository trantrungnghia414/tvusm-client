// client/src/app/(client)/pricing/components/ServicePricingGrid.tsx
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
import ServicePricingCard from "./ServicePricingCard";
import { ServicePricing } from "../types/pricingTypes";

interface ServicePricingGridProps {
    services: ServicePricing[];
    loading?: boolean;
}

export default function ServicePricingGrid({
    services,
    loading = false,
}: ServicePricingGridProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort services
    const filteredServices = React.useMemo(() => {
        let result = [...services];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (service) =>
                    service.name.toLowerCase().includes(searchLower) ||
                    service.description.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            result = result.filter(
                (service) => service.category === categoryFilter
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                case "popular":
                    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
                case "name":
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        // Move popular items to top if sorting by popular
        if (sortBy === "popular") {
            result = [
                ...result.filter((s) => s.popular),
                ...result.filter((s) => !s.popular),
            ];
        }

        return result;
    }, [services, searchTerm, categoryFilter, sortBy]);

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
                        Dịch Vụ Khác
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Trải nghiệm thể thao hoàn hảo với các dịch vụ hỗ trợ đa
                        dạng: cho thuê thiết bị, huấn luyện cá nhân, và nhiều
                        tiện ích khác.
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
                                    placeholder="Tìm kiếm dịch vụ..."
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
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả danh mục
                                    </SelectItem>
                                    <SelectItem value="equipment">
                                        Thiết bị
                                    </SelectItem>
                                    <SelectItem value="coaching">
                                        Huấn luyện
                                    </SelectItem>
                                    <SelectItem value="facility">
                                        Tiện ích
                                    </SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular">
                                        Phổ biến nhất
                                    </SelectItem>
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
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả danh mục
                                    </SelectItem>
                                    <SelectItem value="equipment">
                                        Thiết bị
                                    </SelectItem>
                                    <SelectItem value="coaching">
                                        Huấn luyện
                                    </SelectItem>
                                    <SelectItem value="facility">
                                        Tiện ích
                                    </SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sắp xếp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular">
                                        Phổ biến nhất
                                    </SelectItem>
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
                        Hiển thị {filteredServices.length} trên{" "}
                        {services.length} dịch vụ
                    </p>
                    {(searchTerm || categoryFilter !== "all") && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("all");
                                setSortBy("name");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service) => (
                            <ServicePricingCard
                                key={service.service_id}
                                service={service}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Không tìm thấy dịch vụ nào
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Vui lòng thử lại với từ khóa hoặc bộ lọc khác
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("all");
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
