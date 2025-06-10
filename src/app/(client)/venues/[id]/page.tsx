"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, ChevronLeft } from "lucide-react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import RelatedVenues from "./components/RelatedVenues";
import { Badge } from "@/components/ui/badge";
import VenueHeroSection from "./components/VenueHeroSection";
import VenueStats from "./components/VenueStats";
import VenueDescription from "./components/VenueDescription";
import VenueTabs from "./components/VenueTabs";
import VenueCTA from "./components/VenueCTA";

// Định nghĩa interface cho Venue
interface VenueDetail {
    venue_id: number;
    name: string;
    location: string;
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image?: string;
    created_at: string;
    updated_at?: string;
    description?: string;
    event_count?: number;
    booking_count?: number;
    gallery?: string[];
    facilities?: string[];
}

// Định nghĩa interface cho Event
interface Event {
    event_id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    venue_id?: number;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    max_participants?: number;
    current_participants: number;
    event_type: string;
    image?: string;
    is_public?: boolean;
    is_featured?: boolean;
}

export default function VenueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const venueId = params.id;

    const [venue, setVenue] = useState<VenueDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [actualEventCount, setActualEventCount] = useState<number | null>(
        null
    );
    const [actualBookingCount, setActualBookingCount] = useState<number | null>(
        null
    );

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Chỉ fetch một lần khi venue được tải
    useEffect(() => {
        if (venue && actualEventCount === null) {
            const fetchEventCount = async () => {
                try {
                    const response = await fetchApi(
                        `/events?venue_id=${venue.venue_id}`
                    );

                    if (response.ok) {
                        const events = await response.json();
                        const filteredEvents = events.filter(
                            (event: Event) =>
                                event.status !== "cancelled" &&
                                event.status !== "upcoming"
                        );
                        setActualEventCount(filteredEvents.length);
                    }
                } catch (error) {
                    console.error("Error fetching event count:", error);
                }
            };

            fetchEventCount();
        }
    }, [venue, actualEventCount]);

    useEffect(() => {
        const fetchVenueDetail = async () => {
            if (!venueId) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch venue details và booking stats song song để cải thiện hiệu suất
                const [venueResponse, bookingStatsResponse] = await Promise.all(
                    [
                        fetchApi(`/venues/${venueId}`),
                        fetchApi("/bookings/stats"),
                    ]
                );

                if (!venueResponse.ok) {
                    throw new Error("Không thể tải thông tin nhà thi đấu");
                }

                const data = await venueResponse.json();

                // Xử lý booking stats để lấy booking_count chính xác
                let actualBookingCount = 0;
                if (bookingStatsResponse.ok) {
                    const bookingStats = await bookingStatsResponse.json();

                    if (
                        bookingStats.venueCounts &&
                        bookingStats.venueCounts[data.venue_id || data.id]
                    ) {
                        actualBookingCount =
                            bookingStats.venueCounts[data.venue_id || data.id];
                        // Cập nhật state
                        setActualBookingCount(actualBookingCount);
                    }
                }

                // Chuẩn hóa dữ liệu venue
                const normalizedVenue: VenueDetail = {
                    venue_id: data.venue_id || data.id || Number(venueId),
                    name: data.name || "Nhà thi đấu không xác định",
                    location: data.location || "Địa điểm chưa cập nhật",
                    capacity: data.capacity || null,
                    status: data.status || "active",
                    image: data.image || "/images/placeholder.jpg",
                    created_at: data.created_at || new Date().toISOString(),
                    updated_at: data.updated_at,
                    description:
                        data.description || "Thông tin đang được cập nhật",
                    event_count: data.event_count || 0,
                    booking_count:
                        actualBookingCount || data.booking_count || 0,
                    gallery: Array.isArray(data.gallery)
                        ? data.gallery
                        : [data.image || "/images/placeholder.jpg"],
                    facilities: Array.isArray(data.facilities)
                        ? data.facilities
                        : [
                              "Phòng thay đồ",
                              "Khu vực khán đài",
                              "Hệ thống âm thanh",
                              "Hệ thống chiếu sáng",
                              "Bãi đỗ xe",
                          ],
                };

                setVenue(normalizedVenue);
                // Thêm tiêu đề trang động
                document.title = `${normalizedVenue.name} | TVU Sports Hub`;
            } catch (err) {
                console.error("Error fetching venue details:", err);
                setError("Đã xảy ra lỗi khi tải thông tin nhà thi đấu");
                toast.error("Đã xảy ra lỗi khi tải thông tin nhà thi đấu");
            } finally {
                setLoading(false);
            }
        };

        fetchVenueDetail();
    }, [venueId]);

    // Hiển thị trạng thái nhà thi đấu
    const renderStatus = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge
                        variant="default"
                        className="text-sm px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200"
                    >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Đang hoạt động
                    </Badge>
                );
            case "maintenance":
                return (
                    <Badge
                        variant="outline"
                        className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
                    >
                        <AlertCircle className="w-4 h-4 mr-1.5" />
                        Đang bảo trì
                    </Badge>
                );
            case "inactive":
                return (
                    <Badge variant="destructive" className="text-sm px-3 py-1">
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Tạm ngưng
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        Không xác định
                    </Badge>
                );
        }
    };

    // Hàm callback để nhận số lượng sự kiện từ component VenueEvents
    const updateEventCount = (count: number) => {
        setActualEventCount(count);
    };

    // Hàm xử lý chia sẻ
    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: venue?.name || "Chi tiết nhà thi đấu",
                    text: `Khám phá ${venue?.name} tại TVU Sports Hub`,
                    url: window.location.href,
                })
                .catch((err) => console.error("Không thể chia sẻ:", err));
        } else {
            // Fallback khi không hỗ trợ Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast.success("Đã sao chép liên kết vào clipboard");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <main>
                {venue ? (
                    <>
                        <VenueHeroSection
                            venue={venue}
                            statusBadge={renderStatus(venue.status)}
                            handleShare={handleShare}
                        />

                        <div className="container mx-auto px-4 py-10">
                            <VenueStats
                                capacity={venue.capacity}
                                eventCount={
                                    (actualEventCount !== null
                                        ? actualEventCount
                                        : venue.event_count) || 0
                                }
                                bookingCount={
                                    (actualBookingCount !== null
                                        ? actualBookingCount
                                        : venue.booking_count) || 0
                                }
                                isLoading={loading}
                            />

                            <VenueDescription
                                description={venue.description || ""}
                                isLoading={loading}
                            />

                            <VenueTabs
                                venueId={venue.venue_id}
                                facilities={venue.facilities}
                                gallery={venue.gallery}
                                onEventCountChange={updateEventCount}
                                isLoading={loading}
                            />

                            <VenueCTA venueId={venue.venue_id} />

                            <RelatedVenues currentVenueId={venue.venue_id} />
                        </div>
                    </>
                ) : (
                    <VenueFallbackContent
                        loading={loading}
                        error={error}
                        onRetry={() => window.location.reload()}
                        onBack={() => router.back()}
                    />
                )}
            </main>

            <Footer />

            {showBackToTop && (
                <button
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                    aria-label="Back to top"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m18 15-6-6-6 6" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// Component con xử lý hiển thị khi đang tải hoặc có lỗi
function VenueFallbackContent({
    loading,
    error,
    onRetry,
    onBack,
}: {
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    onBack: () => void;
}) {
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-gray-600 text-xl">
                        Đang tải thông tin nhà thi đấu...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
                    <div className="text-red-600 mb-5">
                        <AlertCircle className="mx-auto h-14 w-14" />
                    </div>
                    <h3 className="text-2xl font-medium text-red-900 mb-3">
                        Không thể tải thông tin nhà thi đấu
                    </h3>
                    <p className="text-red-700 mb-8 text-lg">{error}</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="outline" size="lg" onClick={onBack}>
                            <ChevronLeft className="mr-2 h-5 w-5" />
                            Quay lại
                        </Button>
                        <Button size="lg" onClick={onRetry}>
                            Thử lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
