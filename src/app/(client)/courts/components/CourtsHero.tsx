"use client";

import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CourtsStats {
    totalCourts: number;
    availableCourts: number;
    indoorCourts: number;
    outdoorCourts: number;
    totalBookings: number;
    averageRate: number;
}

interface CourtsHeroProps {
    stats: CourtsStats;
}

export default function CourtsHero({ stats }: CourtsHeroProps) {
    return (
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: "30px 30px",
                    }}
                />
            </div>

            <div className="relative container mx-auto px-4 py-20 lg:py-28">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Hệ thống sân thể thao
                        {/* <span className="block text-blue-200">TVU Stadium Management</span> */}
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                        Khám phá và đặt sân thể thao hiện đại với đầy đủ tiện
                        nghi tại Trường Đại học Trà Vinh
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-white">
                                {stats.totalCourts}
                            </div>
                            <div className="text-blue-200 text-sm">
                                Tổng số sân
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-green-300">
                                {stats.availableCourts}
                            </div>
                            <div className="text-blue-200 text-sm">
                                Sân khả dụng
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-yellow-300">
                                {stats.indoorCourts}
                            </div>
                            <div className="text-blue-200 text-sm">
                                Sân trong nhà
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="text-2xl md:text-3xl font-bold text-orange-300">
                                {stats.totalBookings}
                            </div>
                            <div className="text-blue-200 text-sm">
                                Lượt đặt sân
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link href="/booking">
                            <Button
                                size="lg"
                                className="bg-white text-blue-700 hover:bg-blue-50 font-medium px-8 py-3"
                            >
                                <Calendar className="mr-2 h-5 w-5" />
                                Đặt sân ngay
                            </Button>
                        </Link>
                        <Link href="/venues">
                            <Button
                                size="lg"
                                className="text-white border-white hover:bg-white/10 px-8 py-3 bg-transparent border-1"
                            >
                                <MapPin className="mr-2 h-5 w-5" />
                                Xem nhà thi đấu
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
