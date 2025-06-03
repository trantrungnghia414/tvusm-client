"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    status: "active" | "maintenance" | "inactive";
    image?: string;
    capacity?: number;
}

interface RelatedVenuesProps {
    currentVenueId: number;
}

export default function RelatedVenues({ currentVenueId }: RelatedVenuesProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(4); // Ban đầu hiển thị 4 nhà thi đấu

    useEffect(() => {
        const fetchRelatedVenues = async () => {
            try {
                setLoading(true);
                setError(null);

                // Lấy tất cả nhà thi đấu
                const response = await fetchApi("/venues");

                if (response.ok) {
                    const data = await response.json();

                    // Lọc bỏ nhà thi đấu hiện tại và chỉ lấy trạng thái active và maintenance
                    const otherVenues = data.filter(
                        (venue: Venue) =>
                            venue.venue_id !== currentVenueId &&
                            (venue.status === "active" ||
                                venue.status === "maintenance")
                    );

                    setVenues(otherVenues);
                } else {
                    throw new Error("Không thể tải danh sách nhà thi đấu khác");
                }
            } catch (err) {
                console.error("Error fetching related venues:", err);
                setError("Đã xảy ra lỗi khi tải danh sách nhà thi đấu khác");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedVenues();
    }, [currentVenueId]);

    // Hàm xử lý URL ảnh
    const getImageUrl = (path: string): string => {
        if (!path) return "/images/placeholder.jpg";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        if (path.startsWith("/uploads")) {
            return `http://localhost:3000${path}`;
        }

        return path;
    };

    // Hàm để xem thêm nhà thi đấu
    const handleLoadMore = () => {
        setVisibleCount((prevCount) => Math.min(prevCount + 4, venues.length));
    };

    // Hiển thị trạng thái nhà thi đấu
    const renderStatus = (status: string) => {
        if (status === "active") {
            return (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Đang hoạt động
                </span>
            );
        } else if (status === "maintenance") {
            return (
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    Đang bảo trì
                </span>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                <span>Đang tải...</span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (venues.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                    Không có nhà thi đấu khác để hiển thị
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {venues.slice(0, visibleCount).map((venue) => (
                    <Link
                        href={`/venues/${venue.venue_id}`}
                        key={venue.venue_id}
                    >
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden h-full flex flex-col">
                            <div className="relative h-48">
                                <img
                                    src={getImageUrl(venue.image || "")}
                                    alt={venue.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (
                                            e.currentTarget.src !==
                                            "/images/placeholder.jpg"
                                        ) {
                                            e.currentTarget.src =
                                                "/images/placeholder.jpg";
                                        }
                                    }}
                                />
                                {/* Hiển thị badge trạng thái góc phải trên */}
                                <div className="absolute top-2 right-2">
                                    {renderStatus(venue.status)}
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg line-clamp-2 mb-2">
                                    {venue.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3 flex-1">
                                    {venue.location}
                                </p>
                                {venue.capacity && (
                                    <p className="text-sm text-gray-500 mb-2">
                                        Sức chứa:{" "}
                                        {venue.capacity.toLocaleString("vi-VN")}{" "}
                                        người
                                    </p>
                                )}
                                <div className="mt-2">
                                    <span className="text-blue-600 text-sm font-medium inline-flex items-center">
                                        Xem chi tiết{" "}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Nút xem thêm */}
            {visibleCount < venues.length && (
                <div className="text-center pt-2">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                        Xem thêm ({venues.length - visibleCount} nhà thi đấu
                        khác)
                    </Button>
                </div>
            )}
        </div>
    );
}
