import React from "react";
import Link from "next/link";
import { MapPin, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getImageUrl } from "@/lib/api";

interface VenueCardProps {
    id: number;
    name: string;
    location: string;
    description: string;
    image: string;
    status: "active" | "maintenance" | "inactive";
    capacity?: number;
    priority?: boolean;
}

export default function VenueCard({
    id,
    name,
    location,
    description,
    image,
    status,
    capacity,
    priority,
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={getImageUrl(image) || "/images/placeholder.jpg"}
                    alt={name}
                    width={400}
                    height={300}
                    priority={priority}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                        <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm">
                            Sức chứa: {capacity} người
                        </span>
                    </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-1 min-h-[1.25rem]">
                    {description || "\u00A0"}
                </p>
                

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">06:00 - 22:00</span>
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
