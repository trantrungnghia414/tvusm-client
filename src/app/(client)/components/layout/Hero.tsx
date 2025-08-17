"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import Image from "next/image";

// Interface cho thống kê
interface StatsData {
    courtCount: number;
    userCount: number;
}

export default function Hero() {
    const [stats, setStats] = useState<StatsData>({
        courtCount: 0,
        userCount: 0,
    });
    const [loading, setLoading] = useState(true);

    // Fetch dữ liệu thống kê từ API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Gọi API để lấy số lượng sân thể thao
                const courtsResponse = await fetchApi("/courts");

                // Gọi API để lấy số lượng người dùng
                const usersResponse = await fetchApi("/users");

                let courtsCount = 0;
                let usersCount = 0;

                if (courtsResponse.ok) {
                    const courtsData = await courtsResponse.json();
                    courtsCount = Array.isArray(courtsData)
                        ? courtsData.length
                        : 0;
                }

                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    usersCount = Array.isArray(usersData)
                        ? usersData.length
                        : 0;
                }

                setStats({
                    courtCount: courtsCount,
                    userCount: usersCount || 50, // Fallback nếu API trả về 0
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                // Giả lập dữ liệu khi có lỗi
                setStats({
                    courtCount: 2,
                    userCount: 50,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Format số lượng người dùng để hiển thị dễ đọc
    const formatUserCount = (count: number): string => {
        if (count < 1000) return `${count}+`;
        const formatted = (count / 1000).toFixed(1);
        return formatted.endsWith(".0")
            ? `${parseInt(formatted)}k+`
            : `${formatted}k+`;
    };

    return (
        <section className="relative bg-gradient-to-r from-blue-700 to-indigo-800 pt-22 pb-20 md:pb-12 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: "20px 20px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center">
                    <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
                        <span className="inline-block px-4 py-2 bg-blue-900/50 text-blue-100 rounded-full mb-6 backdrop-blur-sm">
                            Nhà thi đấu TVU - Trường Đại học Trà Vinh
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Khu phức hợp thể thao hiện đại tại{" "}
                            <span className="text-[#ffff00]">TVU</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8">
                            Hệ thống cơ sở vật chất thể thao đạt chuẩn quốc tế,
                            sẵn sàng phục vụ mọi nhu cầu rèn luyện sức khỏe và
                            tổ chức sự kiện của bạn.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href="/booking">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-700 hover:bg-blue-50 font-medium"
                                >
                                    <CalendarDays className="mr-2 h-5 w-5" />
                                    Đặt sân ngay
                                </Button>
                            </Link>
                            <Link href="/venues">
                                <Button
                                    size="lg"
                                    className="text-white border-white hover:bg-white/10 bg-transparent border-1"
                                >
                                    Khám phá các sân
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                            {/* Decorative elements */}
                            <Image
                                src="/images/sportshall.jpg"
                                alt="TVU Stadium Management"
                                width={800}
                                height={500}
                                className="w-full h-auto rounded-lg relative z-10"
                                priority
                            />
                        </div>

                        {/* Stats overlay với dữ liệu thực */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg z-20">
                            {loading ? (
                                <div className="flex justify-center items-center py-2">
                                    <Loader2 className="h-5 w-5 text-blue-700 animate-spin mr-2" />
                                    <span className="text-gray-600 text-sm">
                                        Đang tải dữ liệu...
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-blue-700">
                                            {stats.courtCount}+
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Sân thể thao
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-blue-700">
                                            {formatUserCount(stats.userCount)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Người sử dụng
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-blue-700">
                                            6h-22h
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Hoạt động
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
