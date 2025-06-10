"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CourtCard from "@/app/(client)/components/shared/CourtCard";
import { fetchApi } from "@/lib/api";

interface Court {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    type_name: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image?: string;
    venue_id: number;
    venue_name: string;
    is_indoor: boolean;
    description?: string;
    surface_type?: string;
    length?: number;
    width?: number;
    booking_count?: number;
}

interface VenueCourtsProps {
    venueId: number;
}

export default function VenueCourts({ venueId }: VenueCourtsProps) {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Thử lấy sân từ API
                const response = await fetchApi(`/courts?venue_id=${venueId}`);

                if (response.ok) {
                    const data = await response.json();
                    // Lọc thêm lần nữa để chắc chắn chỉ lấy sân của nhà thi đấu này
                    const filteredCourts = data.filter(
                        (court: Court) => court.venue_id === Number(venueId)
                    );

                    // Sort courts by booking count (desc) and court_id (desc)
                    const sortCourts = filteredCourts.sort(
                        (a: Court, b: Court) => {
                            // Xếp hạng theo số lượng đặt sân (booking_count) giảm dần
                            const bookingDiff =
                                (b.booking_count || 0) - (a.booking_count || 0);
                            // Nếu số lượng đặt sân bằng nhau, xếp theo court_id giảm dần
                            return bookingDiff !== 0
                                ? bookingDiff
                                : b.court_id - a.court_id;
                        }
                    );

                    setCourts(sortCourts.slice(0, 8));
                } else {
                    throw new Error("Không thể tải danh sách sân");
                }
            } catch (err) {
                console.error("Error fetching courts:", err);
                setError("Đã xảy ra lỗi khi tải danh sách sân");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [venueId]);

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                    <span>Đang tải danh sách sân...</span>
                </div>
            ) : error ? (
                <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : courts.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">
                        Không có sân thể thao nào trong nhà thi đấu này
                    </p>
                </div>
            ) : (
                <>
                    <h3 className="text-xl font-bold mb-6">
                        Các sân thể thao ({courts.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                surfaceType={court.surface_type}
                                dimensions={
                                    court.length && court.width
                                        ? `${court.length}m x ${court.width}m`
                                        : undefined
                                }
                                bookingCount={court.booking_count}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
