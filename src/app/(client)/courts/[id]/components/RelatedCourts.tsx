"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import CourtCard from "@/app/(client)/components/shared/CourtCard";

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_name: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image?: string;
    venue_id: number;
    venue_name: string;
    is_indoor: boolean;
    description?: string;
    booking_count?: number;
}

interface RelatedCourtsProps {
    currentCourtId: number;
    venueId: number;
}

export default function RelatedCourts({
    currentCourtId,
    venueId,
}: RelatedCourtsProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedCourts = async () => {
            try {
                setLoading(true);
                // Lấy các sân khác trong cùng nhà thi đấu
                const response = await fetchApi(`/courts?venue_id=${venueId}`);

                if (response.ok) {
                    const data = await response.json();
                    // Lọc bỏ sân hiện tại và chỉ lấy các sân đang sẵn sàng hoặc bảo trì
                    const filteredCourts = data.filter(
                        (court: Court) =>
                            court.court_id !== currentCourtId &&
                            (court.status === "available" ||
                                court.status === "maintenance")
                    );
                    setCourts(filteredCourts.slice(0, 4)); // Chỉ lấy tối đa 4 sân
                }
            } catch (error) {
                console.error("Error fetching related courts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedCourts();
    }, [currentCourtId, venueId]);

    if (loading) {
        return (
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Sân thể thao khác</h2>
                <div className="flex justify-center items-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-gray-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (courts.length === 0) {
        return null; // Không hiển thị gì nếu không có sân liên quan
    }

    return (
        <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Sân thể thao khác</h2>

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
                        image={court.image || "/images/placeholder.jpg"}
                        venueId={court.venue_id}
                        venueName={court.venue_name}
                        isIndoor={court.is_indoor}
                        description={court.description}
                        bookingCount={court.booking_count || 0}
                    />
                ))}
            </div>
        </div>
    );
}
