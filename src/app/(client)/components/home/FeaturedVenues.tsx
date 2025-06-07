"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchApi, getImageUrl } from "@/lib/api";
import VenueCard from "@/app/(client)/components/shared/VenueCard";
import { Button } from "@/components/ui/button";

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    description: string;
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image: string;
    created_at: string;
}

export default function FeaturedVenues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const response = await fetchApi("/venues");

                if (response.ok) {
                    const data = await response.json();

                    const displayedVenues = data.filter(
                        (venue: Venue) =>
                            venue.status === "active" ||
                            venue.status === "maintenance"
                    );

                    setVenues(displayedVenues.slice(0, 4));
                } else {
                    setError("Không thể tải dữ liệu nhà thi đấu");
                }
            } catch (error) {
                console.error("Error fetching venues:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    return (
        <section className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Nhà thi đấu mới nhất
                    </h2>
                    <p className="text-gray-600">
                        Khám phá các nhà thi đấu hiện đại và tiện nghi
                    </p>
                </div>
                <Link
                    href="/venues"
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium mt-3 sm:mt-0"
                >
                    Xem tất cả
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">
                        Đang tải dữ liệu...
                    </span>
                </div>
            ) : error ? (
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
            ) : venues.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {venues.map((venue, index) => (
                        <VenueCard
                            key={venue.venue_id}
                            id={venue.venue_id}
                            name={venue.name}
                            location={venue.location}
                            description={venue.description || ""}
                            image={(() => {
                                const imageUrl = venue.image
                                    ? getImageUrl(venue.image)
                                    : null;
                                return imageUrl || "/images/placeholder.jpg";
                            })()}
                            status={venue.status}
                            capacity={venue.capacity || undefined}
                            priority={index < 4} // Chỉ set priority cho 4 ảnh đầu tiên
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                        Không có nhà thi đấu để hiển thị
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        Hãy quay lại sau
                    </p>
                </div>
            )}
        </section>
    );
}
