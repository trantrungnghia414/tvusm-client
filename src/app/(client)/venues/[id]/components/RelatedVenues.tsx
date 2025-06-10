"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import VenueCard from "@/app/(client)/components/shared/VenueCard";

// Định nghĩa interface cho dữ liệu venue
interface Venue {
    venue_id: number;
    name: string;
    location: string;
    capacity?: number | null;
    status?: "active" | "maintenance" | "inactive";
    image?: string;
    event_count?: number;
    description?: string;
}

interface RelatedVenuesProps {
    currentVenueId: number;
    title?: string;
    limit?: number;
}

export default function RelatedVenues({
    currentVenueId,
    title = "Nhà thi đấu khác",
    limit = 4,
}: RelatedVenuesProps) {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRelatedVenues = async () => {
            setLoading(true);
            try {
                const response = await fetchApi(`/venues`);

                if (response.ok) {
                    const data = await response.json();
                    // Lọc ra nhà thi đấu khác với nhà thi đấu hiện tại
                    const otherVenues = data
                        .filter(
                            (v: Venue) =>
                                Number(v.venue_id) !== Number(currentVenueId) &&
                                v.status !== "inactive"
                        )
                        .slice(0, limit);

                    setVenues(otherVenues);
                } else {
                    throw new Error("Không thể tải danh sách nhà thi đấu");
                }
            } catch (err) {
                console.error("Error fetching related venues:", err);
                setError("Đã xảy ra lỗi khi tải danh sách nhà thi đấu khác");
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedVenues();
    }, [currentVenueId, limit]);

    if (error) {
        return (
            <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                    {title}
                </h2>
                <div className="bg-red-50 p-4 rounded-lg text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                {title}
            </h2>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                    <span>Đang tải danh sách nhà thi đấu...</span>
                </div>
            ) : venues.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">
                        Không tìm thấy nhà thi đấu khác
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {venues.map((venue) => (
                        <VenueCard
                            key={venue.venue_id}
                            id={venue.venue_id}
                            name={venue.name}
                            location={venue.location}
                            image={venue.image || "/images/placeholder.jpg"}
                            capacity={venue.capacity || undefined}
                            status={venue.status || "active"}
                            description={
                                venue.description
                                    ? `${venue.description}${
                                          venue.event_count
                                              ? ` (${venue.event_count} sự kiện)`
                                              : ""
                                      }`
                                    : venue.event_count
                                    ? `Số sự kiện: ${venue.event_count}`
                                    : "Không có thông tin mô tả" /* Sửa lỗi 4: Cung cấp giá trị mặc định */
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
