"use client";

import { formatCurrency } from "@/lib/utils";
import { Hash, Users, Layers, DollarSign, Star, Ruler } from "lucide-react";

interface CourtDetailProps {
    court: {
        code: string;
        name: string;
        type_name?: string;
        surface_type?: string;
        length?: number;
        width?: number;
        hourly_rate: number;
        booking_count?: number;
        is_indoor: boolean;
        venue_name?: string;
        created_at?: string;
        status?: string;
        average_rating?: number;
    };
    className?: string;
}

export default function CourtDetail({
    court,
    className = "",
}: CourtDetailProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
        >
            <h2 className="text-2xl font-bold mb-6">Thông tin sân</h2>

            <div className="grid grid-cols-2 gap-5">
                {/* Thông tin cơ bản - luôn hiển thị */}
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-md">
                        <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-1">Mã sân</p>
                        <p className="font-medium">{court.code || "N/A"}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-50 rounded-md">
                        <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-1">
                            Giá thuê (giờ)
                        </p>
                        <p className="font-medium text-green-600">
                            {formatCurrency(court.hourly_rate)}
                        </p>
                    </div>
                </div>

                {/* Thông tin tùy chọn */}
                {court.surface_type && (
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-amber-50 rounded-md">
                            <Layers className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-500 mb-1">
                                Loại mặt sân
                            </p>
                            <p className="font-medium">{court.surface_type}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-teal-50 rounded-md">
                        <Ruler className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-1">Kích thước</p>
                        <p className="font-medium">
                            {court.length !== undefined &&
                            court.width !== undefined
                                ? `${court.length}m × ${court.width}m`
                                : court.length !== undefined
                                ? `Dài: ${court.length}m`
                                : court.width !== undefined
                                ? `Rộng: ${court.width}m`
                                : "Không xác định"}
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-md">
                        <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm text-gray-500 mb-1">
                            Lượt đặt sân
                        </p>
                        <p className="font-medium">
                            {court.booking_count || 0} lượt
                        </p>
                    </div>
                </div>

                {/* Đánh giá trung bình */}
                {court.average_rating !== undefined && (
                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-yellow-50 rounded-md">
                            <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-500 mb-1">
                                Đánh giá
                            </p>
                            <p className="font-medium flex items-center">
                                <span className="text-yellow-600">
                                    {court.average_rating.toFixed(1)}
                                </span>
                                <span className="text-gray-400 mx-1">/</span>
                                <span>5.0</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
