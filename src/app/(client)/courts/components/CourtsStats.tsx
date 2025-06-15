"use client";

import React from "react";
import {
    MapPin,
    Building,
    Home,
    Clock,
    Calendar,
    TrendingUp,
} from "lucide-react";

interface CourtsStats {
    totalCourts: number;
    availableCourts: number;
    indoorCourts: number;
    outdoorCourts: number;
    totalBookings: number;
}

interface CourtsStatsProps {
    stats: CourtsStats;
}

export default function CourtsStats({ stats }: CourtsStatsProps) {
    // Tính toán tỷ lệ sử dụng an toàn hơn
    const calculateUsageRate = () => {
        if (stats.totalCourts === 0) return 0;

        // Giả sử mỗi sân có thể được đặt tối đa 12 giờ/ngày trong 30 ngày
        const maxPossibleBookings = stats.totalCourts * 12 * 30;
        const usageRate = (stats.totalBookings / maxPossibleBookings) * 100;

        return Math.min(Math.round(usageRate), 100); // Giới hạn tối đa 100%
    };

    const statsData = [
        {
            icon: <MapPin className="h-8 w-8" />,
            label: "Tổng số sân",
            value: stats.totalCourts.toString(),
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            description: "Đa dạng các loại sân thể thao",
        },
        {
            icon: <Building className="h-8 w-8" />,
            label: "Sân trong nhà",
            value: stats.indoorCourts.toString(),
            color: "text-green-600",
            bgColor: "bg-green-50",
            description: "Không ảnh hưởng bởi thời tiết",
        },
        {
            icon: <Home className="h-8 w-8" />,
            label: "Sân ngoài trời",
            value: stats.outdoorCourts.toString(),
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            description: "Không gian thoáng đãng",
        },
        {
            icon: <Calendar className="h-8 w-8" />,
            label: "Lượt đặt sân",
            value: stats.totalBookings.toString(),
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            description: "Tổng số lượt đặt sân",
        },
        {
            icon: <Clock className="h-8 w-8" />,
            label: "Sân khả dụng",
            value: stats.availableCourts.toString(),
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            description: "Sẵn sàng phục vụ",
        },
        {
            icon: <TrendingUp className="h-8 w-8" />,
            label: "Tỷ lệ sử dụng",
            value: `${calculateUsageRate()}%`,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            description: "Hiệu suất sử dụng sân",
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Thống kê hệ thống sân thể thao
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        Hệ thống sân thể thao hiện đại với đầy đủ các môn thể
                        thao phổ biến, phục vụ nhu cầu rèn luyện sức khỏe và thi
                        đấu của sinh viên và cộng đồng
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {statsData.map((stat, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
                        >
                            <div className="flex items-start space-x-4">
                                <div
                                    className={`${stat.bgColor} ${stat.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {stat.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {stat.label}
                                    </h3>
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {stat.value}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
