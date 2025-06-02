"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    MapPin,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    CalendarDays,
    Star,
    ChevronRight,
    Share2,
    InfoIcon,
} from "lucide-react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import VenueCourts from "./components/VenueCourts";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import VenueGallery from "./components/VenueGallery";
import VenueFacilities from "./components/VenueFacilities";
import VenueEvents from "./components/VenueEvents";
import RelatedVenues from "./components/RelatedVenues";
import Link from "next/link";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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

export default function VenueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const venueId = params.id;

    const [venue, setVenue] = useState<VenueDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("sân thi đấu");

    // Xóa state scrollY không cần thiết
    // const [scrollY, setScrollY] = useState(0);

    // Thêm state mới cho nút back-to-top
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Thêm state mới cho số lượng sự kiện thực tế
    const [actualEventCount, setActualEventCount] = useState<number | null>(
        null
    );

    // Xóa useEffect không cần thiết cho hiệu ứng parallax
    useEffect(() => {
        // Chỉ theo dõi scroll cho nút back-to-top
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
                        `/events?venue_id=${venue.venue_id}&status=completed,ongoing`
                    );

                    if (response.ok) {
                        const events = await response.json();
                        setActualEventCount(events.length);
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

                const response = await fetchApi(`/venues/${venueId}`);

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin nhà thi đấu");
                }

                const data = await response.json();

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
                    booking_count: data.booking_count || 0,
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

    // Hàm xử lý URL ảnh với kiểm soát lỗi chặt chẽ hơn
    const getImageUrl = (path: string): string => {
        if (!path || typeof path !== "string") {
            return "/images/placeholder.jpg";
        }

        try {
            if (path.startsWith("http://") || path.startsWith("https://")) {
                return path;
            }

            if (path.startsWith("/uploads")) {
                return `http://localhost:3000${path}`;
            }

            return path;
        } catch (error) {
            console.error("Error processing image URL:", error);
            return "/images/placeholder.jpg";
        }
    };

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

    // Hàm chia đoạn cho mô tả
    const formatDescription = (text: string) => {
        if (!text) return [];
        return text.split("\n").filter((paragraph) => paragraph.trim() !== "");
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
                {loading ? (
                    <div className="container mx-auto px-4 py-20 flex justify-center">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-gray-600 text-xl">
                                Đang tải thông tin nhà thi đấu...
                            </p>
                        </div>
                    </div>
                ) : error ? (
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
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => router.back()}
                                >
                                    <ChevronLeft className="mr-2 h-5 w-5" />
                                    Quay lại
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={() => window.location.reload()}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : venue ? (
                    <>
                        {/* Hero Section - Đã loại bỏ hiệu ứng parallax */}
                        <div
                            id="venue-hero-section"
                            className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden"
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url(${getImageUrl(
                                        venue.image || ""
                                    )})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    // Đã xóa transform
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

                            {/* Breadcrumbs */}
                            <div className="absolute top-6 pt-16 left-0 w-full">
                                <div className="container mx-auto px-4">
                                    <div className="flex items-center text-white/80 text-sm">
                                        <Link
                                            href="/"
                                            className="hover:text-white"
                                        >
                                            Trang chủ
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <Link
                                            href="/venues"
                                            className="hover:text-white"
                                        >
                                            Nhà thi đấu
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <span className="text-white font-medium truncate max-w-[180px]">
                                            {venue.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-end">
                                <div className="container mx-auto px-4 pb-16 md:pb-20">
                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                        {renderStatus(venue.status)}
                                        <div className="flex items-center gap-1 bg-yellow-400/90 text-yellow-900 px-2.5 py-1 rounded-full">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-medium">
                                                4.8
                                            </span>
                                            <span className="text-sm">
                                                (24 đánh giá)
                                            </span>
                                        </div>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        onClick={handleShare}
                                                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30"
                                                    >
                                                        <Share2 className="h-4 w-4 text-white" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Chia sẻ</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-md">
                                        {venue.name}
                                    </h1>
                                    <div className="flex items-center text-white mb-6">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        <p className="text-lg md:text-xl">
                                            {venue.location}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() =>
                                            router.push(
                                                "/booking?venue_id=" +
                                                    venue.venue_id
                                            )
                                        }
                                    >
                                        <CalendarDays className="mr-2 h-5 w-5" />
                                        Đặt sân ngay
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="container mx-auto px-4 py-10">
                            {/* Quick Stats - Thống kê nhanh */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {venue.capacity && (
                                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
                                            <Users className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium mb-1">
                                                Sức chứa
                                            </p>
                                            <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                                {venue.capacity.toLocaleString(
                                                    "vi-VN"
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                người xem
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-sm">
                                        <Calendar className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium mb-1">
                                            Sự kiện đã tổ chức
                                        </p>
                                        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                            {(actualEventCount !== null
                                                ? actualEventCount
                                                : venue.event_count
                                            )?.toLocaleString("vi-VN") || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            sự kiện thành công
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-sm">
                                        <Clock className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium mb-1">
                                            Lượt đặt sân
                                        </p>
                                        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                            {venue.booking_count?.toLocaleString(
                                                "vi-VN"
                                            ) || 0}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            lượt đặt thành công
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả */}
                            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-10">
                                <h2 className="text-2xl font-bold mb-6 flex items-center">
                                    <InfoIcon className="mr-2 h-5 w-5 text-blue-600" />
                                    Giới thiệu
                                </h2>
                                <div className="text-gray-700 leading-relaxed space-y-4">
                                    {formatDescription(
                                        venue.description || ""
                                    ).map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Tabs - Kiểu tab hiện đại hơn */}
                            <div className="mb-8">
                                <div className="border-b border-gray-200 flex overflow-x-auto no-scrollbar">
                                    <div className="flex space-x-2 md:space-x-8">
                                        {[
                                            "Sân thi đấu",
                                            "Sự kiện",
                                            "Tiện ích",
                                            "Hình ảnh",
                                        ].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() =>
                                                    setActiveTab(
                                                        tab.toLowerCase()
                                                    )
                                                }
                                                className={`
                                                    relative py-4 px-2 whitespace-nowrap font-medium text-base transition-colors
                                                    ${
                                                        activeTab ===
                                                        tab.toLowerCase()
                                                            ? "text-blue-600"
                                                            : "text-gray-600 hover:text-gray-900"
                                                    }
                                                `}
                                            >
                                                {tab}
                                                {activeTab ===
                                                    tab.toLowerCase() && (
                                                    <span className="absolute h-1 bg-blue-600 bottom-0 left-0 right-0 rounded-t-md"></span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content - sử dụng key để tránh re-render không cần thiết */}
                            <div className="mb-16">
                                {activeTab === "sân thi đấu" && (
                                    <VenueCourts
                                        key="venue-courts"
                                        venueId={venue.venue_id}
                                    />
                                )}
                                {activeTab === "sự kiện" && (
                                    <VenueEvents
                                        key="venue-events"
                                        venueId={venue.venue_id}
                                        onEventCountChange={updateEventCount}
                                    />
                                )}
                                {activeTab === "tiện ích" && (
                                    <VenueFacilities
                                        key="venue-facilities"
                                        facilities={venue.facilities || []}
                                    />
                                )}
                                {activeTab === "hình ảnh" && (
                                    <VenueGallery
                                        key="venue-gallery"
                                        images={venue.gallery || []}
                                    />
                                )}
                            </div>

                            {/* CTA - Đẹp hơn với gradient và box shadow */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl overflow-hidden mb-16">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-pattern opacity-10"></div>
                                    <div className="p-8 md:p-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between relative">
                                        <div className="mb-6 md:mb-0 md:mr-8">
                                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                                Quan tâm đến nhà thi đấu này?
                                            </h2>
                                            <p className="text-blue-100 text-lg max-w-lg">
                                                Đặt sân ngay hôm nay để có trải
                                                nghiệm thể thao tuyệt vời cùng
                                                bạn bè và đồng đội!
                                            </p>
                                        </div>
                                        <Link href="/booking">
                                            <Button
                                                size="lg"
                                                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                <CalendarDays className="mr-2 h-5 w-5" />
                                                Đặt sân ngay
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Related Venues */}
                            <div className="mb-16">
                                <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                                    <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                                    Nhà thi đấu khác
                                </h2>
                                <RelatedVenues
                                    currentVenueId={venue.venue_id}
                                />
                            </div>
                        </div>
                    </>
                ) : null}
            </main>

            <Footer />

            {/* Nút back-to-top - sử dụng showBackToTop thay vì scrollY > 500 */}
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
