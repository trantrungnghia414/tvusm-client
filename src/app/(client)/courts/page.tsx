"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import CourtsHero from "@/app/(client)/courts/components/CourtsHero";
import CourtsStats from "@/app/(client)/courts/components/CourtsStats";
import CourtsFilters from "@/app/(client)/courts/components/CourtsFilters";
import CourtsList from "@/app/(client)/courts/components/CourtsList";

// Interface cho Court
interface Court {
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
}

// Interface cho thống kê
interface CourtsStats {
    totalCourts: number;
    availableCourts: number;
    indoorCourts: number;
    outdoorCourts: number;
    totalBookings: number;
    averageRate: number;
}

// Interface cho dữ liệu thô từ API
interface RawCourt {
    court_id?: number;
    id?: number;
    name?: string;
    code?: string;
    type_id?: number;
    type_name?: string;
    venue_id?: number;
    venue_name?: string;
    hourly_rate?: number;
    status?: "available" | "booked" | "maintenance";
    image?: string;
    thumbnail?: string;
    description?: string;
    is_indoor?: boolean;
    surface_type?: string;
    length?: number;
    width?: number;
    created_at?: string;
    updated_at?: string;
    booking_count?: number;
}

export default function CourtsPage() {
    // States cho bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [venueFilter, setVenueFilter] = useState("all");
    const [indoorFilter, setIndoorFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    // States cho dữ liệu
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<CourtsStats>({
        totalCourts: 0,
        availableCourts: 0,
        indoorCourts: 0,
        outdoorCourts: 0,
        totalBookings: 0,
        averageRate: 0,
    });

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchCourtsData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Thử lần lượt các endpoint có thể sử dụng được
                let response;
                let data = [];

                const endpoints = [
                    "/courts",
                    "/courts/all",
                    "/courts?limit=50",
                ];

                let success = false;

                for (const endpoint of endpoints) {
                    try {
                        console.log(`Đang thử kết nối tới endpoint: ${endpoint}`);
                        response = await fetchApi(endpoint);

                        if (response.ok) {
                            data = await response.json();
                            console.log(`Kết nối thành công tới: ${endpoint}`, data);
                            success = true;
                            break;
                        }
                    } catch (endpointError) {
                        console.warn(`Không thể kết nối tới ${endpoint}:`, endpointError);
                    }
                }

                // Nếu không có endpoint nào hoạt động, sử dụng dữ liệu mẫu
                if (!success) {
                    console.warn("Tất cả các endpoint đều thất bại, sử dụng dữ liệu mẫu");
                    setError("Đang sử dụng dữ liệu mẫu - Vui lòng liên hệ quản trị viên");
                }

                // Đảm bảo dữ liệu có định dạng đúng
                const normalizedData = data.map(normalizeCourtData);
                setCourts(normalizedData);

                // Tính toán số liệu thống kê từ dữ liệu đã chuẩn hóa
                calculateAndSetStats(normalizedData);
            } catch (err) {
                console.error("Error fetching courts:", err);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchCourtsData();
    }, []);

    // Hàm chuẩn hóa dữ liệu court từ API
    const normalizeCourtData = (court: RawCourt): Court => {
        return {
            court_id: court.court_id || court.id || Math.floor(Math.random() * 1000),
            name: court.name || "Sân thể thao không xác định",
            code: court.code || `C${Math.floor(Math.random() * 1000)}`,
            type_id: court.type_id || 1,
            type_name: court.type_name || "Loại sân chưa xác định",
            venue_id: court.venue_id || 1,
            venue_name: court.venue_name || "Địa điểm chưa xác định",
            hourly_rate: court.hourly_rate || 0,
            status: court.status || "available",
            image: court.image || court.thumbnail || "/images/placeholder.jpg",
            description: court.description || "Thông tin đang được cập nhật",
            is_indoor: court.is_indoor || false,
            surface_type: court.surface_type || "Chưa xác định",
            length: court.length,
            width: court.width,
            created_at: court.created_at || new Date().toISOString(),
            updated_at: court.updated_at,
            booking_count: court.booking_count || 0,
        };
    };

    // Hàm tính toán và cập nhật số liệu thống kê
    const calculateAndSetStats = (courts: Court[]) => {
        const totalBookings = courts.reduce(
            (total: number, court: Court) => total + (court.booking_count || 0),
            0
        );

        const averageRate = courts.length > 0 
            ? courts.reduce((total: number, court: Court) => total + court.hourly_rate, 0) / courts.length
            : 0;

        setStats({
            totalCourts: courts.length,
            availableCourts: courts.filter(court => court.status === "available").length,
            indoorCourts: courts.filter(court => court.is_indoor).length,
            outdoorCourts: courts.filter(court => !court.is_indoor).length,
            totalBookings,
            averageRate,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <main>
                <CourtsHero stats={stats} />
                <CourtsStats stats={stats} />
                <div className="container mx-auto px-4 py-8">
                    <CourtsFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        typeFilter={typeFilter}
                        setTypeFilter={setTypeFilter}
                        venueFilter={venueFilter}
                        setVenueFilter={setVenueFilter}
                        indoorFilter={indoorFilter}
                        setIndoorFilter={setIndoorFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                    <CourtsList
                        courts={courts}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        typeFilter={typeFilter}
                        venueFilter={venueFilter}
                        indoorFilter={indoorFilter}
                        sortBy={sortBy}
                        loading={loading}
                        error={error}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}