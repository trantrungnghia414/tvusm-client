"use client";

import React, { useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import CourtCard from "@/app/(client)/components/shared/CourtCard";

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    type_name: string;
    venue_id: number;
    venue_name: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image?: string;
    description?: string;
    is_indoor: boolean;
    surface_type?: string;
    length?: number;
    width?: number;
    created_at: string;
    updated_at?: string;
    booking_count?: number;
}

interface CourtsListProps {
    courts: Court[];
    searchTerm: string;
    statusFilter: string;
    typeFilter: string;
    venueFilter: string;
    indoorFilter: string;
    sortBy: string;
    loading: boolean;
    error: string | null;
}

export default function CourtsList({
    courts,
    searchTerm,
    statusFilter,
    typeFilter,
    venueFilter,
    indoorFilter,
    sortBy,
    loading,
    error,
}: CourtsListProps) {
    const filteredAndSortedCourts = useMemo(() => {
        let result = [...courts];

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (court) =>
                    court.name.toLowerCase().includes(searchLower) ||
                    court.code.toLowerCase().includes(searchLower) ||
                    court.type_name.toLowerCase().includes(searchLower) ||
                    court.venue_name.toLowerCase().includes(searchLower) ||
                    (court.description?.toLowerCase() || "").includes(
                        searchLower
                    )
            );
        }

        // Lọc theo trạng thái
        if (statusFilter !== "all") {
            result = result.filter((court) => court.status === statusFilter);
        }

        // Lọc theo loại sân
        if (typeFilter !== "all") {
            result = result.filter(
                (court) => court.type_id.toString() === typeFilter
            );
        }

        // Lọc theo địa điểm
        if (venueFilter !== "all") {
            result = result.filter(
                (court) => court.venue_id.toString() === venueFilter
            );
        }

        // Lọc theo vị trí (trong nhà/ngoài trời)
        if (indoorFilter !== "all") {
            if (indoorFilter === "indoor") {
                result = result.filter((court) => court.is_indoor);
            } else if (indoorFilter === "outdoor") {
                result = result.filter((court) => !court.is_indoor);
            }
        }

        // Sắp xếp
        result.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "rate_asc":
                    return a.hourly_rate - b.hourly_rate;
                case "rate_desc":
                    return b.hourly_rate - a.hourly_rate;
                case "popular":
                    return (b.booking_count || 0) - (a.booking_count || 0);
                case "newest":
                    return (
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    );
                default:
                    return 0;
            }
        });

        return result;
    }, [
        courts,
        searchTerm,
        statusFilter,
        typeFilter,
        venueFilter,
        indoorFilter,
        sortBy,
    ]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Đang tải danh sách sân...
                </h3>
                <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <div className="text-red-600 mb-4">
                    <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-red-900 mb-2">
                    Không thể tải danh sách sân
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (filteredAndSortedCourts.length === 0) {
        return (
            <div className="text-center py-20">
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Không tìm thấy sân nào
                </h3>
                <p className="text-gray-500 text-lg mb-2">
                    Không có sân thể thao nào phù hợp với tiêu chí tìm kiếm
                </p>
                <p className="text-gray-400">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Danh sách sân thể thao
                </h2>
                <p className="text-gray-600">
                    Tìm thấy {filteredAndSortedCourts.length} sân
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedCourts.map((court) => (
                    <CourtCard
                        key={court.court_id}
                        id={court.court_id}
                        name={court.name}
                        code={court.code}
                        type={court.type_name}
                        hourlyRate={court.hourly_rate}
                        status={court.status}
                        image={court.image || ""}
                        venueId={court.venue_id}
                        venueName={court.venue_name}
                        isIndoor={court.is_indoor}
                        description={court.description}
                        bookingCount={court.booking_count}
                    />
                ))}
            </div>
        </div>
    );
}
