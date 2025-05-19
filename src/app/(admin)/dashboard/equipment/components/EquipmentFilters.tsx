import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/lib/api";
import { EquipmentCategory, Venue } from "../types/equipmentTypes";

interface EquipmentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    venueFilter: string;
    setVenueFilter: (value: string) => void;
}

export default function EquipmentFilters({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    venueFilter,
    setVenueFilter,
}: EquipmentFiltersProps) {
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                const [categoriesResponse, venuesResponse] = await Promise.all([
                    fetchApi("/equipment/categories", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/venues", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                }

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    setVenues(venuesData);
                }
            } catch (error) {
                console.error("Error fetching filter data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilterData();
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Tìm kiếm thiết bị..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                    disabled={loading}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Loại thiết bị" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
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
                        <SelectItem value="available">Sẵn sàng</SelectItem>
                        <SelectItem value="in_use">Đang sử dụng</SelectItem>
                        <SelectItem value="maintenance">
                            Đang bảo trì
                        </SelectItem>
                        <SelectItem value="unavailable">
                            Không khả dụng
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={venueFilter}
                    onValueChange={setVenueFilter}
                    disabled={loading}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả khu vực</SelectItem>
                        <SelectItem value="none">Thiết bị chung</SelectItem>
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
        </div>
    );
}
