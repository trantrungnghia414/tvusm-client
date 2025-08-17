"use client";

import React, { useState, useEffect } from "react";
import { Users, MapPin, Calendar, Award, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface StatsData {
    venueCount: number;
    bookingCount: number;
    userCount: number;
    satisfactionRate: number;
}

interface Venue {
    venue_id: number;
    name: string;
    location: string;
    description: string;
    capacity: number | null;
    status: "active" | "maintenance" | "inactive";
    image: string;
    created_at: string;
}

export default function StatisticsSection() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsData>({
        venueCount: 0,
        bookingCount: 0,
        userCount: 0,
        satisfactionRate: 95, // Giá trị mặc định cho tỷ lệ hài lòng
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Fetch dữ liệu venues để đếm số nhà thi đấu
                const venuesResponse = await fetchApi("/venues");
                let venueCount = 0;

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    venueCount = venuesData.filter(
                        (venue: Venue) =>
                            venue.status === "active" ||
                            venue.status === "maintenance"
                    ).length;
                }

                // Fetch dữ liệu bookings để đếm số lượt đặt
                const bookingsResponse = await fetchApi("/bookings/stats");
                let bookingCount = 0;

                if (bookingsResponse.ok) {
                    const bookingData = await bookingsResponse.json();
                    bookingCount = bookingData.totalBookings || 0;
                }

                // Fetch dữ liệu users để đếm số người dùng
                const usersResponse = await fetchApi("/users");
                let userCount = 0;

                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    userCount = Array.isArray(usersData) ? usersData.length : 0;
                }

                // Cập nhật state
                setStats({
                    venueCount,
                    bookingCount,
                    userCount,
                    satisfactionRate: 95, // Hoặc fetch từ API nếu có
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                // Giữ giá trị mặc định nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Hàm định dạng số
    const formatNumber = (count: number): string => {
        if (count < 1000) return `${count}+`;
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith(".0")
            ? `${parseInt(formatted)}k+`
            : `${formatted}k+`;
    };

    // Dữ liệu hiển thị
    const statsData = [
        {
            icon: <MapPin className="h-10 w-10 text-blue-500" />,
            value: formatNumber(stats.venueCount),
            label: "Nhà thi đấu",
            description: "Với cơ sở vật chất hiện đại",
        },
        {
            icon: <Calendar className="h-10 w-10 text-blue-500" />,
            value: formatNumber(stats.bookingCount),
            label: "Lượt đặt sân",
            description: "Từ sinh viên và khách hàng",
        },
        {
            icon: <Users className="h-10 w-10 text-blue-500" />,
            value: formatNumber(stats.userCount),
            label: "Người dùng",
            description: "Sử dụng hệ thống đặt sân TVU",
        },
        {
            icon: <Award className="h-10 w-10 text-blue-500" />,
            value: `${stats.satisfactionRate}%`,
            label: "Hài lòng",
            description: "Từ người dùng về dịch vụ",
        },
    ];

    return (
        <section className="py-6 container mx-auto px-4">
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <span className="ml-2 text-gray-600">
                        Đang tải dữ liệu...
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {statsData.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="bg-blue-50 p-3 rounded-lg w-16 h-16 flex items-center justify-center mb-4">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                {stat.value}
                            </h3>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                {stat.label}
                            </h4>
                            <p className="text-gray-600">{stat.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
