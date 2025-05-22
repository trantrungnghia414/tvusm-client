"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import CourtCard from "../shared/CourtCard";
import { fetchApi } from "@/lib/api";

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    type_name: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image: string;
    venue_id: number;
    venue_name: string;
    is_indoor: boolean;
}

export default function PopularCourts() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await fetchApi("/courts?limit=4");
                if (!response.ok) {
                    throw new Error("Không thể tải thông tin sân thi đấu");
                }

                const data = await response.json();
                setCourts(data);
            } catch (error) {
                console.error("Error fetching courts:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
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
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Sân thi đấu phổ biến
                        </h2>
                        <p className="text-gray-600">
                            Khám phá các sân thi đấu được yêu thích nhất
                        </p>
                    </div>
                    <Link
                        href="/courts"
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Xem tất cả
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courts.map((court) => (
                        <CourtCard
                            key={court.court_id}
                            id={court.court_id}
                            name={court.name}
                            code={court.code}
                            type={court.type_name}
                            hourlyRate={court.hourly_rate}
                            status={court.status}
                            image={
                                court.image ||
                                "https://via.placeholder.com/300x200?text=No+Image"
                            }
                            venueId={court.venue_id}
                            venueName={court.venue_name}
                            isIndoor={court.is_indoor}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
