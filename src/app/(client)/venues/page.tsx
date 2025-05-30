"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import VenuesHero from "./components/VenuesHero";
import VenuesStats from "@/app/(client)/venues/components/VenuesStats";
import VenuesList from "@/app/(client)/venues/components/VenuesList";
import VenuesFilters from "@/app/(client)/venues/components/VenuesFilters";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

// Định nghĩa interface cho Venue
interface Venue {
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
}

// Định nghĩa interface cho thống kê
interface VenueStats {
    totalVenues: number;
    totalCapacity: number;
    totalEvents: number;
    totalBookings: number;
}

export default function VenuesPage() {
    // States cho bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    // States cho dữ liệu - chú ý các kiểu dữ liệu đã được khai báo
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<VenueStats>({
        totalVenues: 0,
        totalCapacity: 0,
        totalEvents: 0,
        totalBookings: 0,
    });

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        const fetchVenuesData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Thử lần lượt các endpoint có thể sử dụng được
                let response;
                let data = [];

                // Mảng các endpoint để thử
                const endpoints = [
                    "/venues", // API cơ bản nhất
                    "/venues/all", // Endpoint có thể được sử dụng trong admin
                    "/courts/venues", // Có thể lấy thông tin venues từ courts
                    "/venues?limit=20", // Thêm query param
                ];

                let success = false;

                // Thử từng endpoint cho đến khi thành công
                for (const endpoint of endpoints) {
                    try {
                        console.log(
                            `Đang thử kết nối tới endpoint: ${endpoint}`
                        );
                        response = await fetchApi(endpoint);

                        if (response.ok) {
                            data = await response.json();
                            console.log(
                                `Kết nối thành công tới: ${endpoint}`,
                                data
                            );
                            success = true;
                            break;
                        }
                    } catch (endpointError) {
                        console.warn(
                            `Không thể kết nối tới ${endpoint}:`,
                            endpointError
                        );
                    }
                }

                // Nếu không có endpoint nào hoạt động, sử dụng dữ liệu mẫu
                if (!success) {
                    console.warn(
                        "Tất cả các endpoint đều thất bại, sử dụng dữ liệu mẫu"
                    );
                    setError(
                        "Đang sử dụng dữ liệu mẫu - Vui lòng liên hệ quản trị viên"
                    );
                }

                // Đảm bảo dữ liệu có định dạng đúng
                const normalizedData = data.map(normalizeVenueData);
                setVenues(normalizedData);

                // Tính toán số liệu thống kê từ dữ liệu đã chuẩn hóa
                calculateAndSetStats(normalizedData);
            } catch (err) {
                console.error("Error fetching venues:", err);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchVenuesData();
    }, []);

    // Interface cho dữ liệu thô từ API
    interface RawVenue {
        venue_id?: number;
        id?: number;
        name?: string;
        location?: string;
        capacity?: number | null;
        status?: "active" | "maintenance" | "inactive";
        image?: string;
        thumbnail?: string;
        created_at?: string;
        updated_at?: string;
        description?: string;
        event_count?: number;
        booking_count?: number;
    }

    // Hàm chuẩn hóa dữ liệu venue từ API
    const normalizeVenueData = (venue: RawVenue): Venue => {
        return {
            venue_id:
                venue.venue_id || venue.id || Math.floor(Math.random() * 1000),
            name: venue.name || "Nhà thi đấu không xác định",
            location: venue.location || "Địa điểm chưa cập nhật",
            capacity: venue.capacity || null,
            status: venue.status || "active",
            image:
                venue.image ||
                venue.thumbnail ||
                "/images/venue-placeholder.jpg",
            created_at: venue.created_at || new Date().toISOString(),
            updated_at: venue.updated_at,
            description: venue.description || "Thông tin đang được cập nhật",
            event_count: venue.event_count || 0,
            booking_count: venue.booking_count || 0,
        };
    };

    // Hàm tính toán và cập nhật số liệu thống kê
    const calculateAndSetStats = (venues: Venue[]) => {
        const totalCapacity = venues.reduce((total: number, venue: Venue) => {
            return total + (venue.capacity || 0);
        }, 0);

        setStats({
            totalVenues: venues.length,
            totalCapacity,
            totalEvents: venues.reduce(
                (total: number, venue: Venue) =>
                    total + (venue.event_count || 0),
                0
            ),
            totalBookings: venues.reduce(
                (total: number, venue: Venue) =>
                    total + (venue.booking_count || 0),
                0
            ),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />
            <main>
                <VenuesHero stats={stats} />
                <VenuesStats stats={stats} />
                <div className="container mx-auto px-4 py-8">
                    <VenuesFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                    />
                    <VenuesList
                        venues={venues}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
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
