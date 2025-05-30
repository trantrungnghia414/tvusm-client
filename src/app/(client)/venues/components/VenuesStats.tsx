"use client";

import React from "react";
import { Building2, Users, Calendar, Trophy } from "lucide-react";

interface VenuesStatsProps {
    stats: {
        totalVenues: number;
        totalCapacity: number;
        totalEvents: number;
        totalBookings: number;
    };
}

export default function VenuesStats({ stats }: VenuesStatsProps) {
    const statsData = [
        {
            icon: <Building2 className="h-8 w-8" />,
            label: "Nhà thi đấu",
            value: stats.totalVenues.toString(),
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            icon: <Users className="h-8 w-8" />,
            label: "Sức chứa tổng",
            value: stats.totalCapacity.toLocaleString(),
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            icon: <Calendar className="h-8 w-8" />,
            label: "Sự kiện đã tổ chức",
            value: stats.totalEvents.toString(),
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            icon: <Trophy className="h-8 w-8" />,
            label: "Lượt đặt sân",
            value: stats.totalBookings.toString(),
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Thống kê hệ thống
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Những con số ấn tượng về cơ sở vật chất và hoạt động của
                        TVU Sports Hub
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} ${stat.color} rounded-full mb-4`}
                            >
                                {stat.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {stat.value}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
