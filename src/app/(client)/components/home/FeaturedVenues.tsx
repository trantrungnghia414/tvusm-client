"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import VenueCard from "../shared/VenueCard";
import { fetchApi } from "@/lib/api";

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    description: string;
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image: string;
}

export default function FeaturedVenues() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetchApi("/venues?limit=4");
                if (!response.ok) {
                    throw new Error("Không thể tải thông tin nhà thi đấu");
                }
                const data = await response.json();
                setVenues(data);
            } catch (error) {
                console.error("Error fetching venues:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center items-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Nhà thi đấu nổi bật
                    </h2>
                    <p className="text-gray-600">
                        Khám phá các nhà thi đấu hiện đại và tiện nghi
                    </p>
                </div>
                <Link
                    href="/venues"
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    Xem tất cả
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {venues.map((venue) => (
                    <VenueCard
                        key={venue.venue_id}
                        id={venue.venue_id}
                        name={venue.name}
                        location={venue.location}
                        description={venue.description || ""}
                        image={
                            venue.image ||
                            "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        status={venue.status}
                        capacity={venue.capacity || undefined}
                    />
                ))}
            </div>
        </section>
    );
}
