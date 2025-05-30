"use client";

import React from "react";
import Link from "next/link";
import {
    MapPin,
    Users,
    Clock,
    Star,
    CheckCircle,
    AlertTriangle,
    Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VenueCardProps {
    id: number;
    name: string;
    location: string;
    description: string;
    image: string;
    status: "active" | "maintenance" | "inactive";
    capacity?: number;
    rating?: number;
    amenities?: string[];
    openingHours?: string;
}

export default function VenueCard({
    id,
    name,
    location,
    description,
    image,
    status,
    capacity,
    rating = 4.5,
    amenities = [],
    openingHours = "06:00 - 22:00",
}: VenueCardProps) {
    const statusConfig = {
        active: {
            color: "bg-green-100 text-green-800 border-green-200",
            label: "Đang hoạt động",
            icon: <CheckCircle className="h-4 w-4 mr-1" />,
        },
        maintenance: {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            label: "Đang bảo trì",
            icon: <Settings className="h-4 w-4 mr-1" />,
        },
        inactive: {
            color: "bg-red-100 text-red-800 border-red-200",
            label: "Ngừng hoạt động",
            icon: <AlertTriangle className="h-4 w-4 mr-1" />,
        },
    };

    // Hàm xử lý lỗi khi không thể tải hình ảnh
    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement>
    ) => {
        event.currentTarget.src = "/images/placeholder.jpg";
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
            <div className="relative h-52 overflow-hidden">
                <img
                    src={image || "/images/placeholder.jpg"}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={handleImageError}
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge
                        className={`${statusConfig[status].color} flex items-center`}
                    >
                        {statusConfig[status].icon}
                        {statusConfig[status].label}
                    </Badge>
                </div>

                {rating && (
                    <div className="absolute bottom-3 right-3">
                        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                                {rating.toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {name}
                </h3>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span className="text-sm truncate">{location}</span>
                    </div>

                    {capacity && (
                        <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                            <span className="text-sm">
                                Sức chứa: {capacity.toLocaleString()} người
                            </span>
                        </div>
                    )}

                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                        <span className="text-sm">{openingHours}</span>
                    </div>
                </div>

                <p className="text-gray-600 text-sm mb-5 line-clamp-2 flex-grow">
                    {description || "Không có thông tin mô tả."}
                </p>

                {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {amenities.map((amenity, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                                {amenity}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link href={`/venues/${id}`}>
                        <Button
                            className="w-full"
                            disabled={status === "inactive"}
                            variant={
                                status === "maintenance" ? "outline" : "default"
                            }
                        >
                            {status === "inactive"
                                ? "Tạm dừng hoạt động"
                                : status === "maintenance"
                                ? "Xem chi tiết (Đang bảo trì)"
                                : "Xem chi tiết"}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
