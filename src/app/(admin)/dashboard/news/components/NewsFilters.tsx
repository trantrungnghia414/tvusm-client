import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { NewsCategory } from "../types/newsTypes";

interface NewsFiltersProps {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    categoryFilter: string;
    setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
    statusFilter: string;
    setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
}

export default function NewsFilters({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
}: NewsFiltersProps) {
    const [categories, setCategories] = useState<NewsCategory[]>([]);

    // Fetch danh mục từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/news/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="bg-white p-4 rounded-md border space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            className="absolute right-0 top-0 h-9 w-9 p-0"
                            onClick={() => setSearchTerm("")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Category dropdown */}
                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                >
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {categories.map((category) => (
                            <SelectItem
                                key={category.category_id}
                                value={category.category_id.toString()}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Status filter tabs */}
            <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full"
            >
                <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
                    <TabsTrigger value="draft">Bản nháp</TabsTrigger>
                    <TabsTrigger value="archived">Lưu trữ</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
