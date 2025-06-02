"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import { Loader2, MapPin } from "lucide-react";

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image?: string;
}

interface RelatedVenuesProps {
    currentVenueId: number;
}

export default function RelatedVenues({ currentVenueId }: RelatedVenuesProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedVenues = async () => {
            try {
                setLoading(true);
                const response = await fetchApi("/venues");

                if (response.ok) {
                    const allVenues = await response.json();

                    // Lọc ra 3 nhà thi đấu khác với nhà thi đấu hiện tại
                    const relatedVenues = allVenues
                        .filter(
                            (venue: Venue) =>
                                venue.venue_id !== currentVenueId &&
                                venue.status === "active"
                        )
                        .slice(0, 3);

                    setVenues(relatedVenues);
                }
            } catch (error) {
                console.error("Error fetching related venues:", error);
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

    if (loading) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-6">Nhà thi đấu khác</h2>
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (venues.length === 0) {
        return null;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Nhà thi đấu khác</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {venues.map((venue) => (
                    <Link
                        href={`/venues/${venue.venue_id}`}
                        key={venue.venue_id}
                    >
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full border border-gray-100">
                            <div className="relative h-48">
                                <img
                                    src={getImageUrl(venue.image || "")}
                                    alt={venue.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {venue.name}
                                </h3>
                                <div className="flex items-center text-gray-600 mb-3">
                                    <MapPin className="h-4 w-4 mr-1.5" />
                                    <span className="text-sm">
                                        {venue.location}
                                    </span>
                                </div>
                                {venue.capacity && (
                                    <p className="text-sm text-gray-500">
                                        Sức chứa:{" "}
                                        {venue.capacity.toLocaleString("vi-VN")}{" "}
                                        khán giả
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
