// client/src/app/(client)/pricing/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/(client)/components/layout/FixedNavbar";
import Footer from "@/app/(client)/components/layout/Footer";
import PricingHero from "./components/PricingHero";
import PricingTabs from "./components/PricingTabs";
import CourtPricingGrid from "./components/CourtPricingGrid";
import ServicePricingGrid from "./components/ServicePricingGrid";
import PricingPromotionComponent from "./components/PricingPromotion";
import PricingFAQ from "./components/PricingFAQ";
import PricingContact from "./components/PricingContact";
import {
    CourtPricing,
    ServicePricing,
    PricingPromotion,
    PricingTab,
} from "./types/pricingTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export default function PricingPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<PricingTab>(
        (searchParams.get("tab") as PricingTab) || "courts"
    );

    // Data states
    const [courts, setCourts] = useState<CourtPricing[]>([]);
    const [services, setServices] = useState<ServicePricing[]>([]);
    const [promotions, setPromotions] = useState<PricingPromotion[]>([]);

    // Loading states
    const [courtsLoading, setCourtsLoading] = useState(true);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [promotionsLoading, setPromotionsLoading] = useState(true);

    // Fetch courts data
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                setCourtsLoading(true);
                // ✅ Sửa endpoint từ /courts/public thành /courts
                const response = await fetchApi("/courts");

                if (response.ok) {
                    const data = await response.json();

                    // Interface cho dữ liệu thô từ API
                    interface RawCourt {
                        court_id: number;
                        name: string;
                        type_name?: string;
                        court_type?: { name: string };
                        venue_name?: string;
                        venue?: { name: string };
                        hourly_rate?: number;
                        peak_rate?: number;
                        weekend_rate?: number;
                        description?: string;
                        image?: string;
                        is_indoor?: boolean;
                        surface_type?: string;
                        amenities?: string;
                        discount_percentage?: number;
                        // ✅ Thêm các field có thể có từ API
                        booking_count?: number;
                        status?: string;
                        created_at?: string;
                        updated_at?: string;
                        venue_id?: number;
                        type_id?: number;
                    }

                    // Transform court data to match CourtPricing interface
                    const transformedData: CourtPricing[] = data.map(
                        (court: RawCourt) => ({
                            court_id: court.court_id,
                            name: court.name,
                            type_name:
                                court.type_name ||
                                court.court_type?.name ||
                                "Sân thể thao",
                            venue_name:
                                court.venue_name || court.venue?.name || "",
                            hourly_rate: court.hourly_rate || 0,
                            peak_rate:
                                court.peak_rate || court.hourly_rate || 0,
                            weekend_rate:
                                court.weekend_rate || court.hourly_rate || 0,
                            description: court.description || "",
                            image: court.image,
                            is_indoor: court.is_indoor || false,
                            surface_type: court.surface_type || "Chưa xác định",
                            amenities: court.amenities
                                ? court.amenities
                                      .split(",")
                                      .map((item) => item.trim())
                                : ["Hệ thống chiếu sáng", "Phòng thay đồ"],
                            discount_percentage: court.discount_percentage || 0,
                        })
                    );

                    console.log("Transformed courts data:", transformedData);
                    setCourts(transformedData);
                } else {
                    // ✅ Thêm thông tin chi tiết về lỗi
                    const errorData = await response.json().catch(() => ({}));
                    console.error("API Error:", response.status, errorData);
                    throw new Error(
                        `API Error: ${response.status} - ${
                            errorData.message || "Unknown error"
                        }`
                    );
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
                toast.error("Không thể tải dữ liệu sân thể thao");

                // ✅ Fallback với mock data để không bị crash
                const mockCourts: CourtPricing[] = [
                    {
                        court_id: 1,
                        name: "Sân cầu lông 1",
                        type_name: "Cầu lông",
                        venue_name: "Nhà thi đấu A",
                        hourly_rate: 80000,
                        peak_rate: 120000,
                        weekend_rate: 100000,
                        description:
                            "Sân cầu lông chất lượng cao với hệ thống chiếu sáng hiện đại",
                        image: "/images/placeholder-court.jpg",
                        is_indoor: true,
                        surface_type: "Sàn nhựa PVC",
                        amenities: [
                            "Điều hòa",
                            "Hệ thống âm thanh",
                            "Phòng thay đồ",
                        ],
                        discount_percentage: 10,
                    },
                    {
                        court_id: 2,
                        name: "Sân bóng đá mini",
                        type_name: "Bóng đá",
                        venue_name: "Sân ngoài trời B",
                        hourly_rate: 150000,
                        peak_rate: 200000,
                        weekend_rate: 180000,
                        description: "Sân bóng đá mini với cỏ nhân tạo cao cấp",
                        image: "/images/placeholder-court.jpg",
                        is_indoor: false,
                        surface_type: "Cỏ nhân tạo",
                        amenities: [
                            "Khung thành",
                            "Lưới bảo vệ",
                            "Khu vực ngồi",
                        ],
                        discount_percentage: 0,
                    },
                ];
                setCourts(mockCourts);
            } finally {
                setCourtsLoading(false);
            }
        };

        fetchCourts();
    }, []);

    // Fetch services data - giữ nguyên
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setServicesLoading(true);
                // TODO: Replace with actual API endpoint when available
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const mockServices: ServicePricing[] = [
                    {
                        service_id: 1,
                        name: "Cho thuê vợt cầu lông",
                        category: "equipment",
                        price: 20000,
                        unit: "hour",
                        description:
                            "Vợt cầu lông chất lượng cao, phù hợp cho mọi trình độ",
                        image: "/images/services/badminton-racket.jpg",
                        features: [
                            "Vợt Yonex/Victor",
                            "Cán chống trượt",
                            "Đã căng dây",
                        ],
                        popular: true,
                    },
                    {
                        service_id: 2,
                        name: "Huấn luyện cá nhân",
                        category: "coaching",
                        price: 300000,
                        unit: "session",
                        description:
                            "Huấn luyện viên chuyên nghiệp, 1-on-1 coaching",
                        image: "/images/services/personal-coach.jpg",
                        features: [
                            "HLV có chứng chỉ",
                            "Kế hoạch cá nhân",
                            "Video phân tích",
                        ],
                        popular: true,
                    },
                    {
                        service_id: 3,
                        name: "Cho thuê tủ đồ",
                        category: "facility",
                        price: 10000,
                        unit: "day",
                        description:
                            "Tủ đồ an toàn, tiện lợi để cất giữ đồ dùng",
                        image: "/images/services/locker.jpg",
                        features: [
                            "Khóa số an toàn",
                            "Kích thước lớn",
                            "Vệ sinh hàng ngày",
                        ],
                    },
                    {
                        service_id: 4,
                        name: "Nước uống thể thao",
                        category: "other",
                        price: 15000,
                        unit: "piece",
                        description:
                            "Nước uống thể thao chất lượng, bổ sung năng lượng",
                        image: "/images/services/sports-drink.jpg",
                        features: ["Aquarius/Pocari", "Lạnh", "Nhiều vị"],
                    },
                ];

                setServices(mockServices);
            } catch (error) {
                console.error("Error fetching services:", error);
                toast.error("Không thể tải dữ liệu dịch vụ");
                setServices([]);
            } finally {
                setServicesLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Fetch promotions data - giữ nguyên
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setPromotionsLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 800));

                const mockPromotions: PricingPromotion[] = [
                    {
                        promotion_id: 1,
                        title: "Ưu đãi sinh viên TVU",
                        description:
                            "Giảm giá đặc biệt dành riêng cho sinh viên Trường Đại học Trà Vinh",
                        discount_percentage: 20,
                        valid_from: "2024-01-01T00:00:00Z",
                        valid_to: "2024-12-31T23:59:59Z",
                        applicable_to: "all",
                        conditions: [
                            "Xuất trình thẻ sinh viên TVU hợp lệ",
                            "Áp dụng cho tất cả các ngày trong tuần",
                            "Không áp dụng đồng thời với ưu đãi khác",
                        ],
                    },
                    {
                        promotion_id: 2,
                        title: "Giảm giá giờ vàng",
                        description:
                            "Ưu đãi đặc biệt cho khung giờ 14:00 - 17:00 các ngày thường",
                        discount_percentage: 15,
                        valid_from: "2024-01-01T00:00:00Z",
                        valid_to: "2024-06-30T23:59:59Z",
                        applicable_to: "courts",
                        conditions: [
                            "Áp dụng từ Thứ 2 đến Thứ 6",
                            "Khung giờ 14:00 - 17:00",
                            "Đặt trước ít nhất 2 giờ",
                        ],
                    },
                ];

                setPromotions(mockPromotions);
            } catch (error) {
                console.error("Error fetching promotions:", error);
                toast.error("Không thể tải dữ liệu khuyến mãi");
                setPromotions([]);
            } finally {
                setPromotionsLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const handleTabChange = (tab: PricingTab) => {
        setActiveTab(tab);
        // Update URL without causing page reload
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab);
        window.history.pushState({}, "", url.toString());
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-16">
                {/* Hero Section */}
                <PricingHero />

                {/* Navigation Tabs */}
                <PricingTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Main Content */}
                <div className="min-h-[60vh]">
                    {activeTab === "courts" && (
                        <CourtPricingGrid
                            courts={courts}
                            loading={courtsLoading}
                        />
                    )}

                    {activeTab === "services" && (
                        <ServicePricingGrid
                            services={services}
                            loading={servicesLoading}
                        />
                    )}

                    {activeTab === "promotions" && (
                        <PricingPromotionComponent
                            promotions={promotions}
                            loading={promotionsLoading}
                        />
                    )}
                </div>

                {/* FAQ Section */}
                <PricingFAQ />

                {/* Contact Section */}
                <PricingContact />
            </main>

            <Footer />
        </div>
    );
}
