import React from "react";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface CourtTypeFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

export default function CourtTypeFilters({
    searchTerm,
    setSearchTerm,
}: CourtTypeFiltersProps) {
    return (
        <div className="flex justify-between bg-white p-4 rounded-lg border">
            <div className="w-full max-w-[400px] relative">
                <Search className="absolute left-2.5 top-2.75 h-4 w-4 text-gray-500" />
                <Input
                    id="search"
                    placeholder="Tìm kiếm theo tên, mô tả, kích thước..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-8"
                />
            </div>
        </div>
    );
}
