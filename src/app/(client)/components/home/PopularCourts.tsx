"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import CourtCard from "@/app/(client)/components/shared/CourtCard";
// import CourtCard from "../shared/CourtCard";

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

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await fetchApi("/courts?limit=4");
                if (response.ok) {
                    const data = await response.json();
                    setCourts(data);
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, []);

    // Dữ liệu mẫu
    const placeholderCourts: Court[] = [
        {
            court_id: 1,
            name: "Sân cầu lông 1",
            code: "CL01",
            type_id: 1,
            type_name: "Cầu lông",
            hourly_rate: 150000,
            status: "available",
            image: "/images/court-1.jpg",
            venue_id: 1,
            venue_name: "Nhà Thi Đấu TVU",
            is_indoor: true,
        },
        {
            court_id: 2,
            name: "Sân cầu lông 2",
            code: "CL02",
            type_id: 1,
            type_name: "Cầu lông",
            hourly_rate: 150000,
            status: "available",
            image: "/images/court-2.jpg",
            venue_id: 1,
            venue_name: "Nhà Thi Đấu TVU",
            is_indoor: true,
        },
        {
            court_id: 3,
            name: "Sân bóng rổ",
            code: "BR01",
            type_id: 2,
            type_name: "Bóng rổ",
            hourly_rate: 250000,
            status: "available",
            image: "/images/court-3.jpg",
            venue_id: 1,
            venue_name: "Nhà Thi Đấu TVU",
            is_indoor: true,
        },
        {
            court_id: 4,
            name: "Sân bóng chuyền",
            code: "BC01",
            type_id: 3,
            type_name: "Bóng chuyền",
            hourly_rate: 150000,
            status: "available",
            image: "/images/court-4.jpg",
            venue_id: 1,
            venue_name: "Nhà Thi Đấu TVU",
            is_indoor: true,
        },
    ];

    const displayCourts = courts.length > 0 ? courts : placeholderCourts;

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
                    {displayCourts.map((court) => (
                        <CourtCard
                            key={court.court_id}
                            id={court.court_id}
                            name={court.name}
                            code={court.code}
                            type={court.type_name}
                            hourlyRate={court.hourly_rate}
                            status={court.status}
                            image={
                                court.image || "/images/court-placeholder.jpg"
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
