import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourtTypeFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

export default function CourtTypeFilters({
    searchTerm,
    setSearchTerm,
}: CourtTypeFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full">
                <Label htmlFor="search" className="sr-only">
                    Tìm kiếm
                </Label>
                <Input
                    id="search"
                    placeholder="Tìm kiếm theo tên, mô tả, kích thước..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                />
            </div>
        </div>
    );
}
