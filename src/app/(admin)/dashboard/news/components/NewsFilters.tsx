import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
// import { toast } from "sonner";
import { NewsCategory } from "../types/newsTypes";

interface NewsFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
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

    // Fetch danh mục tin tức
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetchApi("/news/categories", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách danh mục");
                }

                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                // Silent fail - không hiển thị toast lỗi
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <Input
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="published">Đã đăng</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
