"use client";

import React from "react";
import { MapPin, Clock, Star } from "lucide-react";

interface VenuesHeroProps {
    stats: {
        totalVenues: number;
        totalCapacity: number;
        totalEvents: number;
        totalBookings: number;
    };
}

export default function VenuesHero({ stats }: VenuesHeroProps) {
    return (
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: "30px 30px",
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                        Nhà thi đấu hiện đại
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                        Khám phá các nhà thi đấu đạt chuẩn quốc tế với cơ sở vật
                        chất hiện đại và dịch vụ chuyên nghiệp
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-center mb-3">
                                <MapPin className="h-8 w-8 text-yellow-300" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                {stats.totalVenues}+
                            </h3>
                            <p className="text-blue-100">Nhà thi đấu</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-center mb-3">
                                <Clock className="h-8 w-8 text-yellow-300" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">24/7</h3>
                            <p className="text-blue-100">Hoạt động liên tục</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <div className="flex items-center justify-center mb-3">
                                <Star className="h-8 w-8 text-yellow-300" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">4.8/5</h3>
                            <p className="text-blue-100">Đánh giá trung bình</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
