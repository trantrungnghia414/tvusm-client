"use client";

import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EquipmentCategory } from "../types/equipmentTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Search } from "lucide-react";

interface EquipmentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
}

// Xóa interface Venue không sử dụng

export default function EquipmentFilters({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
}: EquipmentFiltersProps) {
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch danh mục thiết bị
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true); // Sử dụng biến state đã đổi tên
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/equipment/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách danh mục");
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Không thể tải danh sách danh mục");
            } finally {
                setIsLoading(false); // Sử dụng biến state đã đổi tên
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="flex justify-between bg-white p-4 rounded-lg border">
            <div className="relative w-full flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    id="search"
                    placeholder="Tên thiết bị, mã, mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading} // Hiển thị trạng thái loading
                    className="h-9 pl-8"
                />
            </div>

            <div className="flex items-center gap-8">
                {/* <div className="w-full sm:w-[180px]"> */}
                <div className="flex items-center gap-2">
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                        disabled={isLoading} // Hiển thị trạng thái loading
                    >
                        <SelectTrigger id="category">
                            <SelectValue
                                placeholder={
                                    isLoading ? "Đang tải..." : "Chọn danh mục"
                                }
                            />
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
                <div className="flex items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Tất cả trạng thái
                            </SelectItem>
                            <SelectItem value="available">Sẵn sàng</SelectItem>
                            <SelectItem value="in_use">Đang sử dụng</SelectItem>
                            <SelectItem value="maintenance">Bảo trì</SelectItem>
                            <SelectItem value="unavailable">
                                Không sẵn sàng
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
