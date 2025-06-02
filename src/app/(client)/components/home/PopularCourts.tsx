"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import CourtCard from "@/app/(client)/components/shared/CourtCard";
import { Button } from "@/components/ui/button";

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
    // Thêm các trường mới
    description?: string;
    booking_count?: number;
}

export default function PopularCourts() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                // Tăng limit từ 4 lên 8 để lấy 8 sân
                const response = await fetchApi("/courts?limit=8&sort=popular");

                // Sắp xếp phía client (nếu cần)
                if (response.ok) {
                    const data = await response.json();
                    // Giả sử API trả về booking_count
                    const sortedCourts = [...data]
                        .sort(
                            (a, b) =>
                                (b.booking_count || 0) - (a.booking_count || 0)
                        )
                        .slice(0, 8);
                    setCourts(sortedCourts);
                } else {
                    setError("Không thể tải dữ liệu sân thể thao");
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, []);

    return (
        <section className="bg-gray-50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            Sân thi đấu phổ biến
                        </h2>
                        <p className="text-gray-600">
                            Khám phá 8 sân thi đấu được yêu thích nhất
                        </p>
                    </div>
                    <Link
                        href="/courts"
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
                ) : courts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {courts.map((court) => (
                            <CourtCard
                                key={court.court_id}
                                id={court.court_id}
                                name={court.name}
                                code={court.code}
                                type={court.type_name}
                                hourlyRate={court.hourly_rate}
                                status={court.status}
                                image={court.image || "/images/placeholder.jpg"}
                                venueId={court.venue_id}
                                venueName={court.venue_name}
                                isIndoor={court.is_indoor}
                                description={court.description}
                                bookingCount={court.booking_count || 0}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            Không có sân thể thao để hiển thị
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Hãy quay lại sau
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
