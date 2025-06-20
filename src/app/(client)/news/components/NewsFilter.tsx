// client/src/app/(client)/news/components/NewsFilter.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsCategory } from "../types/newsTypes";
import { Filter, Star, X } from "lucide-react";

interface NewsFilterProps {
    categories: NewsCategory[];
    selectedCategory: string;
    onCategoryChange: (categoryId: string) => void;
    showFeatured: boolean;
    onFeaturedChange: (featured: boolean) => void;
    activeFiltersCount: number;
    onClearFilters: () => void;
}

export default function NewsFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    showFeatured,
    onFeaturedChange,
    activeFiltersCount,
    onClearFilters,
}: NewsFilterProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Bộ lọc
                </h3>

                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-gray-500 hover:text-gray-700 gap-1"
                    >
                        <X className="h-4 w-4" />
                        Xóa bộ lọc ({activeFiltersCount})
                    </Button>
                )}
            </div>

            {/* Featured Filter */}
            <div className="mb-6">
                <Button
                    variant={showFeatured ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFeaturedChange(!showFeatured)}
                    className={`gap-2 ${
                        showFeatured
                            ? "bg-red-500 hover:bg-red-600"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                >
                    <Star
                        className={`h-4 w-4 ${
                            showFeatured ? "fill-current" : ""
                        }`}
                    />
                    Tin nổi bật
                </Button>
            </div>

            {/* Categories */}
            <div>
                <h4 className="font-medium text-gray-900 mb-3">Danh mục</h4>
                <div className="space-y-2">
                    <Button
                        variant={
                            selectedCategory === "all" ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => onCategoryChange("all")}
                    >
                        Tất cả danh mục
                        <Badge variant="secondary" className="ml-auto">
                            {categories.reduce((total) => total, 0)}
                        </Badge>
                    </Button>

                    {categories.map((category) => (
                        <Button
                            key={category.category_id}
                            variant={
                                selectedCategory ===
                                category.category_id.toString()
                                    ? "default"
                                    : "ghost"
                            }
                            className="w-full justify-start"
                            onClick={() =>
                                onCategoryChange(
                                    category.category_id.toString()
                                )
                            }
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Lọc nhanh</h4>
                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => {
                            onCategoryChange("all");
                            onFeaturedChange(true);
                        }}
                    >
                        Tin hot
                    </Badge>
                    <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-green-50"
                        onClick={() => {
                            // Filter by recent (you can implement date-based filtering)
                            onCategoryChange("all");
                        }}
                    >
                        Mới nhất
                    </Badge>
                </div>
            </div>
        </div>
    );
}
