import React from "react";
import { Users, Calendar, Clock } from "lucide-react";

interface VenueStatsProps {
    capacity: number | null;
    eventCount: number;
    bookingCount: number;
    isLoading?: boolean;
}

export default function VenueStats({
    capacity,
    eventCount,
    bookingCount,
    isLoading = false,
}: VenueStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 animate-pulse"
                    >
                        <div className="bg-gray-300 p-3 rounded-xl h-14 w-14"></div>
                        <div className="w-full">
                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                            <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {capacity && (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
                        <Users className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            Sức chứa
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                            {capacity.toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-gray-600">người xem</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-sm">
                    <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                        Sự kiện đã tổ chức
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {eventCount.toLocaleString("vi-VN") || 0}
                    </p>
                    <p className="text-sm text-gray-600">sự kiện thành công</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-sm">
                    <Clock className="h-7 w-7 text-white" />
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">
                        Lượt đặt sân
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        {bookingCount.toLocaleString("vi-VN") || 0}
                    </p>
                    <p className="text-sm text-gray-600">lượt đặt thành công</p>
                </div>
            </div>
        </div>
    );
}
