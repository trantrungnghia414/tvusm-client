import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface VenueFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function VenueFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
}: VenueFiltersProps) {
    return (
        <div className="flex justify-between bg-white p-4 rounded-lg border">
            <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Tìm theo tên, địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="flex items-center gap-2">
                <Label htmlFor="status-filter">Trạng thái</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="maintenance">
                            Đang bảo trì
                        </SelectItem>
                        <SelectItem value="inactive">
                            Ngừng hoạt động
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
