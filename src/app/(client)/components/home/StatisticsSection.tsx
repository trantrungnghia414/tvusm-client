import React from "react";
import { Users, MapPin, Calendar, Award } from "lucide-react";

export default function StatisticsSection() {
    const stats = [
        {
            icon: <MapPin className="h-10 w-10 text-blue-500" />,
            value: "2+",
            label: "Nhà thi đấu",
            description: "Với cơ sở vật chất hiện đại",
        },
        {
            icon: <Calendar className="h-10 w-10 text-blue-500" />,
            value: "1000+",
            label: "Lượt đặt sân",
            description: "Mỗi tháng từ sinh viên và khách hàng",
        },
        {
            icon: <Users className="h-10 w-10 text-blue-500" />,
            value: "5000+",
            label: "Người dùng",
            description: "Sử dụng hệ thống đặt sân TVU",
        },
        {
            icon: <Award className="h-10 w-10 text-blue-500" />,
            value: "100%",
            label: "Hài lòng",
            description: "Từ người dùng về dịch vụ",
        },
    ];

    return (
        <section className="py-16 container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
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
        </section>
    );
}
