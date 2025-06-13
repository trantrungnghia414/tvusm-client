"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import VenuesStats from "@/app/(client)/venues/components/VenuesStats";
import VenuesList from "@/app/(client)/venues/components/VenuesList";
import VenuesFilters from "@/app/(client)/venues/components/VenuesFilters";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import VenuesHero from "@/app/(client)/venues/components/VenuesHero";

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

// Định nghĩa interface cho Event
interface Event {
    event_id: number;
    status: string;
    venue_id: number;
    current_participants?: number;
}

// Định nghĩa interface cho các đối tượng đếm
interface CountsMap {
    [key: number]: number;
}

export default function VenuesPage() {
    // States cho bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    // States cho dữ liệu
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<VenueStats>({
        totalVenues: 0,
        totalCapacity: 0,
        totalEvents: 0,
        totalBookings: 0,
    });

    // Fetch tất cả dữ liệu cần thiết khi component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch đồng thời cả venues, events và bookings để tối ưu thời gian
                const [venuesResponse, eventsResponse, bookingsResponse] =
                    await Promise.all([
                        fetchApi("/venues"),
                        fetchApi("/events"),
                        fetchApi("/bookings/stats"),
                    ]);

                if (!venuesResponse.ok) {
                    throw new Error("Không thể tải danh sách nhà thi đấu");
                }

                const venuesData = await venuesResponse.json();

                // Xử lý dữ liệu events
                let eventsData: Event[] = [];
                if (eventsResponse.ok) {
                    eventsData = await eventsResponse.json();
                } else {
                    console.warn("Không thể tải dữ liệu sự kiện");
                }

                // Xử lý dữ liệu bookings
                let bookingsData = {
                    venueCounts: {} as Record<number, number>,
                    totalBookings: 0,
                };
                if (bookingsResponse.ok) {
                    bookingsData = await bookingsResponse.json();
                } else {
                    console.warn("Không thể tải dữ liệu đặt sân");
                }

                // Tạo mapping venue_id -> số lượng sự kiện và booking
                const venueEventCounts: CountsMap = {};
                const venueBookingCounts: CountsMap =
                    bookingsData.venueCounts || {};

                // Chỉ đếm sự kiện đã hoàn thành hoặc đang diễn ra
                eventsData.forEach((event: Event) => {
                    if (
                        (event.status === "completed" ||
                            event.status === "ongoing") &&
                        event.venue_id
                    ) {
                        // Tăng số đếm sự kiện cho venue tương ứng
                        venueEventCounts[event.venue_id] =
                            (venueEventCounts[event.venue_id] || 0) + 1;
                    }
                });

                // Chuẩn hóa dữ liệu venue với thông tin sự kiện từ mapping
                const normalizedData = venuesData.map((venue: RawVenue) => {
                    const venueId = venue.venue_id || venue.id || 0;
                    return normalizeVenueData(
                        venue,
                        venueEventCounts[venueId] || 0,
                        venueBookingCounts[venueId] || 0
                    );
                });

                console.log("Normalized Venues Data", normalizedData);

                // Lọc ra các venue đang active
                const activeVenues = normalizedData.filter(
                    (venue: Venue) =>
                        venue.status === "active" ||
                        venue.status === "maintenance"
                );

                setVenues(activeVenues);
                calculateAndSetStats(
                    activeVenues,
                    eventsData,
                    bookingsData.totalBookings
                );
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Đã xảy ra lỗi khi tải dữ liệu");
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Hàm chuẩn hóa dữ liệu venue từ API với thông tin sự kiện
    const normalizeVenueData = (
        venue: RawVenue,
        eventCount: number = 0,
        bookingCount: number = 0
    ): Venue => {
        return {
            venue_id:
                venue.venue_id || venue.id || Math.floor(Math.random() * 1000),
            name: venue.name || "Nhà thi đấu không xác định",
            location: venue.location || "Địa điểm chưa cập nhật",
            capacity: venue.capacity || null,
            status: venue.status || "active",
            image: venue.image || venue.thumbnail || "/images/placeholder.jpg",
            created_at: venue.created_at || new Date().toISOString(),
            updated_at: venue.updated_at,
            description: venue.description || "Thông tin đang được cập nhật",
            event_count: eventCount, // Sử dụng số sự kiện đã đếm
            booking_count: bookingCount, // Sử dụng số booking đã đếm
        };
    };

    // Hàm tính toán và cập nhật số liệu thống kê
    const calculateAndSetStats = (
        venues: Venue[],
        events: Event[] = [],
        totalBookings: number = 0
    ) => {
        // Tính tổng sức chứa
        const totalCapacity = venues.reduce((total, venue) => {
            return total + (venue.capacity || 0);
        }, 0);

        // Đếm tất cả sự kiện đã hoàn thành hoặc đang diễn ra
        const completedAndOngoingEvents = events.filter(
            (event: Event) =>
                event.status === "completed" || event.status === "ongoing"
        );

        // Cập nhật stats với dữ liệu đã tính toán
        setStats({
            totalVenues: venues.length,
            totalCapacity,
            // Tổng số sự kiện từ API events
            totalEvents: completedAndOngoingEvents.length,
            // Tổng số lượt đặt từ venue
            totalBookings: totalBookings,
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
