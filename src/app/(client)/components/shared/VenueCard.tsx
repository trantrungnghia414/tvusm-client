import React from "react";
import Link from "next/link";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VenueCardProps {
    id: number;
    name: string;
    location: string;
    description: string;
    image: string;
    status: "active" | "maintenance" | "inactive";
    capacity?: number;
}

export default function VenueCard({
    id,
    name,
    location,
    description,
    image,
    status,
    capacity,
}: VenueCardProps) {
    const statusColors = {
        active: "bg-green-100 text-green-800 border-green-200",
        maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
        inactive: "bg-red-100 text-red-800 border-red-200",
    };

    const statusLabels = {
        active: "Đang hoạt động",
        maintenance: "Đang bảo trì",
        inactive: "Ngừng hoạt động",
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={
                        image.startsWith("/")
                            ? `http://localhost:3000${image}`
                            : image
                    }
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <Badge
                    className={`absolute top-3 right-3 ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </Badge>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

                <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{location}</span>
                </div>

                {capacity && (
                    <div className="flex items-center text-gray-600 mb-3">
                        <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm">
                            Sức chứa: {capacity} người
                        </span>
                    </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">08:00 - 22:00</span>
                    </div>

                    <Link href={`/venues/${id}`}>
                        <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Xem chi tiết
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
