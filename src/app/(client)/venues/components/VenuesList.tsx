"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import VenueCard from "./VenueCard";
import { getImageUrl } from "@/lib/api";

// Cập nhật interface để khớp với interface trong page.tsx
interface Venue {
    venue_id: number;
    name: string;
    location: string;
    description?: string; // Thay đổi từ string thành string | undefined
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image?: string;
    created_at: string;
    updated_at?: string;
    event_count?: number;
    booking_count?: number;
    rating?: number;
    amenities?: string[];
    opening_hours?: string;
}

interface VenuesListProps {
    venues: Venue[];
    searchTerm: string;
    statusFilter: string;
    sortBy: string;
    loading: boolean;
    error: string | null;
}

export default function VenuesList({
    venues,
    searchTerm,
    statusFilter,
    sortBy,
    loading,
    error,
}: VenuesListProps) {
    const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Filter and sort venues based on props
    useEffect(() => {
        let result = [...venues];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (venue) =>
                    venue.name.toLowerCase().includes(searchLower) ||
                    venue.location.toLowerCase().includes(searchLower) ||
                    (venue.description &&
                        venue.description.toLowerCase().includes(searchLower)) // Kiểm tra undefined
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((venue) => venue.status === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "capacity":
                    return (b.capacity || 0) - (a.capacity || 0);
                case "newest":
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                case "rating":
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });

        setFilteredVenues(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [venues, searchTerm, statusFilter, sortBy]);

    // Pagination logic
    const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVenues = filteredVenues.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-600">
                    Đang tải danh sách nhà thi đấu...
                </span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                >
                    Thử lại
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Danh sách nhà thi đấu
                </h2>
                <p className="text-gray-600">
                    Hiển thị {paginatedVenues.length} trong số{" "}
                    {filteredVenues.length} nhà thi đấu
                </p>
            </div>

            {/* Venues Grid */}
            {paginatedVenues.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {paginatedVenues.map((venue) => (
                            <VenueCard
                                key={venue.venue_id}
                                id={venue.venue_id}
                                name={venue.name}
                                location={venue.location}
                                description={venue.description || ""} // Xử lý undefined
                                image={
                                    (venue.image && getImageUrl(venue.image)) ||
                                    "/images/placeholder.jpg"
                                }
                                status={venue.status}
                                capacity={venue.capacity || undefined}
                                rating={venue.rating}
                                amenities={venue.amenities}
                                openingHours={
                                    venue.opening_hours || "06:00 - 22:00"
                                }
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Trước
                            </Button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        currentPage === page
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setCurrentPage(page)}
                                    className="w-10 h-10"
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-2">
                        Không tìm thấy nhà thi đấu nào phù hợp
                    </p>
                    <p className="text-gray-400">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                </div>
            )}
        </div>
    );
}
