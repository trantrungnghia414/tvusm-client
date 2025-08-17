"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, ChevronUp } from "lucide-react";
import { fetchApi, getImageUrl } from "@/lib/api";
import Link from "next/link";

import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import CourtDetail from "./components/CourtDetail";
import CourtFeatures from "@/app/(client)/courts/[id]/components/CourtFeatures";
import CourtSchedule from "@/app/(client)/courts/[id]/components/CourtSchedule";
import CourtRatings from "@/app/(client)/courts/[id]/components/CourtRatings";
import CourtGallery from "@/app/(client)/courts/[id]/components/CourtGallery";
import RelatedCourts from "@/app/(client)/courts/[id]/components/RelatedCourts";
import { Calendar, Info, Star, Image } from "lucide-react";

// Interface cho Court chi tiết
interface CourtDetailType {
    court_id: number;
    name: string;
    code: string;
    type_id: number;
    type_name: string;
    venue_id: number;
    venue_name: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image?: string;
    description?: string;
    is_indoor: boolean;
    surface_type?: string;
    length?: number;
    width?: number;
    created_at: string;
    updated_at?: string;
    booking_count?: number;
    features?: string[];
    gallery?: string[];
    availability?: {
        date: string;
        slots: {
            start_time: string;
            end_time: string;
            is_available: boolean;
        }[];
    }[];
    ratings?: {
        rating_id: number;
        user_id: number;
        user_name: string;
        rating: number;
        comment: string;
        created_at: string;
    }[];
    average_rating?: number;
}

export default function CourtDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courtId = params.id;

    const [court, setCourt] = useState<CourtDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("lịch đặt sân");
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Lấy thông tin chi tiết sân
    useEffect(() => {
        const fetchCourtDetail = async () => {
            if (!courtId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetchApi(`/courts/${courtId}`);

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin sân thể thao");
                }

                const data = await response.json();

                console.log("Court Data:", data);

                // Chuẩn hóa dữ liệu court
                const normalizedCourt: CourtDetailType = {
                    court_id: data.court_id || data.id || Number(courtId),
                    name: data.name || "Sân thể thao không xác định",
                    code: data.code || `C${Math.floor(Math.random() * 1000)}`,
                    type_id: data.type_id || 1,
                    type_name: data.type_name || "Loại sân chưa xác định",
                    venue_id: data.venue_id || 1,
                    venue_name: data.venue_name || "Địa điểm chưa xác định",
                    hourly_rate: data.hourly_rate || 0,
                    status: data.status || "available",
                    image: data.image || "/images/placeholder.jpg",
                    description:
                        data.description || "Thông tin đang được cập nhật",
                    is_indoor: data.is_indoor || false,
                    surface_type: data.surface_type || "Chưa xác định",
                    length: data.length,
                    width: data.width,
                    created_at: data.created_at || new Date().toISOString(),
                    updated_at: data.updated_at,
                    booking_count: data.booking_count || 0,
                    features: Array.isArray(data.features)
                        ? data.features
                        : [
                              "Hệ thống chiếu sáng",
                              "Phòng thay đồ",
                              "Chỗ ngồi cho khán giả",
                              "Khu vực kỹ thuật",
                          ],
                    gallery: Array.isArray(data.gallery)
                        ? data.gallery
                        : [data.image || "/images/placeholder.jpg"],
                    availability: data.availability || [],
                    ratings: data.ratings || [],
                    average_rating: data.average_rating || 4.5,
                };

                // console.log("Normalized Court Data:", normalizedCourt);

                setCourt(normalizedCourt);

                // Thêm tiêu đề trang động
                document.title = `${normalizedCourt.name} | TVU Stadium Management`;
            } catch (err) {
                console.error("Error fetching court details:", err);
                setError("Đã xảy ra lỗi khi tải thông tin sân thể thao");
                toast.error("Đã xảy ra lỗi khi tải thông tin sân thể thao");
            } finally {
                setLoading(false);
            }
        };

        fetchCourtDetail();
    }, [courtId]);

    // Xử lý hiển thị nút back-to-top
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hàm chia đoạn cho mô tả
    const formatDescription = (text: string) => {
        if (!text) return [];
        return text.split("\n").filter((paragraph) => paragraph.trim() !== "");
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
                                Đang tải thông tin sân thể thao...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="container mx-auto px-4 py-20">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
                            <div className="text-red-600 mb-5">
                                <svg
                                    className="mx-auto h-14 w-14"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-medium text-red-900 mb-3">
                                Không thể tải thông tin sân thể thao
                            </h3>
                            <p className="text-red-700 mb-8 text-lg">{error}</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    onClick={() => router.back()}
                                >
                                    <div className="flex items-center">
                                        <ChevronRight className="h-5 w-5 transform rotate-180" />
                                        <span>Quay lại</span>
                                    </div>
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    onClick={() => window.location.reload()}
                                >
                                    Thử lại
                                </button>
                            </div>
                        </div>
                    </div>
                ) : court ? (
                    <>
                        {/* Hero section */}
                        <div className="relative h-[30vh] w-full overflow-hidden">
                            <div
                                className="absolute inset-0"
                                style={{
                                    backgroundImage: `url(${getImageUrl(
                                        court.image || ""
                                    )})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

                            {/* Breadcrumbs */}
                            <div className="absolute top-6 pt-16 left-0 w-full z-10">
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
                                            href="/courts"
                                            className="hover:text-white"
                                        >
                                            Sân thể thao
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <span className="text-white font-medium truncate max-w-[180px]">
                                            {court.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 flex items-end">
                                <div className="container mx-auto px-4 pb-8">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        {/* Status badge */}
                                        {court.status === "available" && (
                                            <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                                Có thể đặt ngay
                                            </span>
                                        )}
                                        {court.status === "maintenance" && (
                                            <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                                Đang bảo trì
                                            </span>
                                        )}
                                        {court.status === "booked" && (
                                            <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                                Đã đặt
                                            </span>
                                        )}

                                        {/* Court type badge */}
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                            {court.type_name}
                                        </span>

                                        {/* Indoor/outdoor badge */}
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                            {court.is_indoor
                                                ? "Sân trong nhà"
                                                : "Sân ngoài trời"}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                                        {court.name}
                                    </h1>

                                    <div className="flex items-center text-white mb-3">
                                        <svg
                                            className="h-5 w-5 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <p className="text-lg">
                                            {court.venue_name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="container mx-auto px-4 py-6">
                            {/* Layout mới: thông tin sân bên trái, tab content bên phải */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Cột bên trái: Thông tin sân và nút đặt sân */}
                                <div className="lg:col-span-1">
                                    {/* Container sticky chứa cả thông tin chi tiết sân và nút đặt sân */}
                                    <div className="sticky top-24 space-y-6 pb-10">
                                        {/* Thông tin chi tiết sân */}
                                        <CourtDetail
                                            court={court}
                                            className="w-full"
                                        />

                                        {/* Nút đặt sân */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                            <button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-md text-lg font-medium transition-colors shadow-md"
                                                onClick={() =>
                                                    router.push(
                                                        `/booking?court_id=${court.court_id}`
                                                    )
                                                }
                                            >
                                                Đặt sân ngay
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Cột bên phải: Tab content */}
                                <div className="lg:col-span-2">
                                    {/* Tabs navigation - Đã cải thiện */}
                                    <div className="mb-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="flex overflow-x-auto no-scrollbar">
                                                <div className="flex w-full">
                                                    {[
                                                        {
                                                            id: "lịch đặt sân",
                                                            label: "Lịch đặt sân",
                                                            icon: (
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                            ),
                                                        },
                                                        {
                                                            id: "thông tin",
                                                            label: "Thông tin",
                                                            icon: (
                                                                <Info className="h-4 w-4 mr-1" />
                                                            ),
                                                        },
                                                        {
                                                            id: "đánh giá",
                                                            label: "Đánh giá",
                                                            icon: (
                                                                <Star className="h-4 w-4 mr-1" />
                                                            ),
                                                        },
                                                        {
                                                            id: "hình ảnh",
                                                            label: "Hình ảnh",
                                                            icon: (
                                                                <Image className="h-4 w-4 mr-1" />
                                                            ),
                                                        },
                                                    ].map((tab) => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() =>
                                                                setActiveTab(
                                                                    tab.id
                                                                )
                                                            }
                                                            className={`
                                                                flex items-center justify-center whitespace-nowrap font-medium transition-colors
                                                                py-3 px-6 text-sm flex-1
                                                                ${
                                                                    activeTab ===
                                                                    tab.id
                                                                        ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                                                        : "text-gray-600 hover:bg-gray-50 border-b-2 border-transparent hover:text-blue-600"
                                                                }
                                                            `}
                                                        >
                                                            {tab.icon}
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tab content */}
                                    <div className="mb-10">
                                        {activeTab === "thông tin" && (
                                            <div className="space-y-6">
                                                {/* Description */}
                                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                                    <h2 className="text-xl font-bold mb-4">
                                                        Giới thiệu về sân
                                                    </h2>
                                                    <div className="prose max-w-none text-gray-700">
                                                        {formatDescription(
                                                            court.description ||
                                                                ""
                                                        ).map(
                                                            (
                                                                paragraph,
                                                                idx
                                                            ) => (
                                                                <p
                                                                    key={idx}
                                                                    className="mb-4"
                                                                >
                                                                    {paragraph}
                                                                </p>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                <CourtFeatures
                                                    features={
                                                        court.features || []
                                                    }
                                                />
                                            </div>
                                        )}

                                        {activeTab === "lịch đặt sân" && (
                                            <CourtSchedule
                                                courtId={court.court_id}
                                            />
                                        )}

                                        {activeTab === "đánh giá" && (
                                            <CourtRatings
                                                ratings={court.ratings || []}
                                                averageRating={
                                                    court.average_rating || 0
                                                }
                                            />
                                        )}

                                        {activeTab === "hình ảnh" && (
                                            <CourtGallery
                                                images={court.gallery || []}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Related courts */}
                            <RelatedCourts
                                currentCourtId={court.court_id}
                                venueId={court.venue_id}
                            />
                        </div>
                    </>
                ) : null}
            </main>

            <Footer />

            {/* Back to top button */}
            {showBackToTop && (
                <button
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                    aria-label="Back to top"
                >
                    <ChevronUp className="h-6 w-6" />
                </button>
            )}
        </div>
    );
}
