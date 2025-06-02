"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    DollarSign,
    CalendarDays,
    Building,
    Home,
    Users,
} from "lucide-react";

interface CourtCardProps {
    id: number;
    name: string;
    code: string;
    type: string;
    hourlyRate: number;
    status: "available" | "booked" | "maintenance";
    image: string;
    venueId: number;
    venueName: string;
    isIndoor: boolean;
    // Thêm các props bị thiếu
    description?: string;
    surfaceType?: string;
    dimensions?: string;
    bookingCount?: number;
}

export default function CourtCard({
    id,
    name,
    code,
    type,
    hourlyRate,
    status,
    image,
    venueName,
    isIndoor,
    description,
    bookingCount,
}: CourtCardProps) {
    const statusColors = {
        available: "bg-green-100 text-green-800 border-green-200",
        booked: "bg-blue-100 text-blue-800 border-blue-200",
        maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    const statusLabels = {
        available: "Sẵn sàng",
        booked: "Đã đặt",
        maintenance: "Đang bảo trì",
    };

    // Định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Hàm xử lý URL ảnh
    const getImageUrl = (path: string) => {
        if (!path || path === "") {
            return "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Court+Image";
        }

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        if (path.startsWith("/uploads")) {
            return `http://localhost:3000${path}`;
        }

        return path;
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getImageUrl(image)}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                            "https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Court+Image";
                    }}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                        variant="outline"
                        className="bg-white/90 text-gray-800 backdrop-blur-sm"
                    >
                        {type}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={`bg-white/90 backdrop-blur-sm ${
                            isIndoor
                                ? "text-blue-800 border-blue-200"
                                : "text-orange-800 border-orange-200"
                        }`}
                    >
                        {isIndoor ? (
                            <>
                                <Building className="h-3 w-3 mr-1" />
                                Trong nhà
                            </>
                        ) : (
                            <>
                                <Home className="h-3 w-3 mr-1" />
                                Ngoài trời
                            </>
                        )}
                    </Badge>
                </div>
                <Badge
                    className={`absolute top-3 right-3 ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </Badge>
                <div className="absolute bottom-3 right-3">
                    <Badge
                        variant="outline"
                        className="bg-white/90 backdrop-blur-sm"
                    >
                        {code}
                    </Badge>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {name}
                </h3>

                {/* Hiển thị mô tả với chiều cao cố định */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-1 min-h-[1.25rem]">
                    {description || "\u00A0"}
                </p>

                <div className="space-y-3 mb-4 flex-grow">
                    <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">{venueName}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium">
                            {formatCurrency(hourlyRate)}/giờ
                        </span>
                    </div>

                    {/* Hiển thị số lượt đặt sân nếu có */}
                    {bookingCount !== undefined && (
                        <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                                {bookingCount} lượt đặt
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-auto">
                    <Link href={`/courts/${id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                            Chi tiết
                        </Button>
                    </Link>
                    <Link href={`/booking?court=${id}`} className="flex-1">
                        <Button
                            className="w-full"
                            disabled={status !== "available"}
                        >
                            <CalendarDays className="mr-1 h-4 w-4" />
                            {status === "available"
                                ? "Đặt sân"
                                : "Không khả dụng"}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
