// client/src/app/(client)/news/components/NewsPagination.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface NewsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
    totalItems?: number;
    itemsPerPage?: number;
}

export default function NewsPagination({
    currentPage,
    totalPages,
    onPageChange,
    showInfo = true,
    totalItems = 0,
    itemsPerPage = 12,
}: NewsPaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
            {/* Info */}
            {showInfo && totalItems > 0 && (
                <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold">{startItem}</span>{" "}
                    đến <span className="font-semibold">{endItem}</span> trong
                    tổng số <span className="font-semibold">{totalItems}</span>{" "}
                    tin tức
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center gap-1">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="gap-1"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {visiblePages.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <div className="px-3 py-2">
                                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                </div>
                            ) : (
                                <Button
                                    variant={
                                        currentPage === page
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    className={`min-w-[40px] ${
                                        currentPage === page
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </Button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
