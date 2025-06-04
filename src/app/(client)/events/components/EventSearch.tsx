import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EventSearchProps {
    searchTerm: string;
    onSearch: (term: string) => void;
    className?: string;
}

export default function EventSearch({
    searchTerm,
    onSearch,
    className = "",
}: EventSearchProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
        </div>
    );
}
