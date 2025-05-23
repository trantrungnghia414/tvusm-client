"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import VenueCard from "../shared/VenueCard";

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

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetchApi("/venues?limit=4");
                if (response.ok) {
                    const data = await response.json();
                    setVenues(data);
                }
            } catch (error) {
                console.error("Error fetching venues:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    // Nếu không có dữ liệu, dùng dữ liệu mẫu
    const placeholderVenues: Venue[] = [
        {
            venue_id: 1,
            name: "Nhà Thi Đấu TVU",
            location: "Kí túc xá Trường Đại học Trà Vinh",
            description: "Nhà Thi Đấu TVU - Kí túc xá Trường Đại học Trà Vinh",
            capacity: 500,
            status: "active",
            image: "/images/venue-1.jpg",
        },
        {
            venue_id: 2,
            name: "Sân bóng đá TVU",
            location: "Sân bóng đá Trường Đại học Trà Vinh",
            description:
                "Sân bóng đá TVU - Sân bóng đá Trường Đại học Trà Vinh",
            capacity: 500,
            status: "active",
            image: "/images/venue-2.jpg",
        },
    ];

    const displayVenues = venues.length > 0 ? venues : placeholderVenues;

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
                {displayVenues.map((venue) => (
                    <VenueCard
                        key={venue.venue_id}
                        id={venue.venue_id}
                        name={venue.name}
                        location={venue.location}
                        description={venue.description || ""}
                        image={venue.image || "/images/venue-placeholder.jpg"}
                        status={venue.status}
                        capacity={venue.capacity || undefined}
                    />
                ))}
            </div>
        </section>
    );
}
