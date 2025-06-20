// client/src/app/(client)/news/components/NewsSearch.tsx
"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
    placeholder?: string;
}

export default function NewsSearch({
    value,
    onChange,
    onSearch,
    placeholder = "Tìm kiếm tin tức...",
}: NewsSearchProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch();
    };

    const handleClear = () => {
        onChange("");
        onSearch();
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div
                className={`relative transition-all duration-200 ${
                    isFocused ? "scale-105" : ""
                }`}
            >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search
                        className={`h-5 w-5 transition-colors ${
                            isFocused ? "text-blue-600" : "text-gray-400"
                        }`}
                    />
                </div>

                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="pl-12 pr-20 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-200"
                />

                <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                    {value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        type="submit"
                        size="sm"
                        className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Tìm
                    </Button>
                </div>
            </div>
        </form>
    );
}
