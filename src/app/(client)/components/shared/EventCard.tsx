import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface EventCardProps {
    id: number;
    title: string;
    description: string;
    image: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    venueName: string;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    maxParticipants?: number;
    currentParticipants?: number;
    eventType: string;
    isPublic: boolean;
    isFeatured: boolean;
}

export default function EventCard({
    id,
    title,
    description,
    image,
    startDate,
    endDate,
    startTime,
    endTime,
    venueName,
    status,
    maxParticipants,
    currentParticipants,
    eventType,
    // isPublic,
    isFeatured,
}: EventCardProps) {
    const statusColors = {
        upcoming: "bg-blue-100 text-blue-800 border-blue-200",
        ongoing: "bg-green-100 text-green-800 border-green-200",
        completed: "bg-gray-100 text-gray-800 border-gray-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusLabels = {
        upcoming: "Sắp diễn ra",
        ongoing: "Đang diễn ra",
        completed: "Đã kết thúc",
        cancelled: "Đã hủy",
    };

    const eventTypeLabels: Record<string, string> = {
        competition: "Giải đấu",
        training: "Tập luyện",
        friendly: "Giao hữu",
        school_event: "Sự kiện trường",
        other: "Khác",
    };

    return (
        <div
            className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group ${
                status === "cancelled" || status === "completed"
                    ? "opacity-75"
                    : ""
            }`}
        >
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                        status === "cancelled" || status === "completed"
                            ? "grayscale"
                            : ""
                    }`}
                    priority={false}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge
                        variant="outline"
                        className="bg-white/90 text-gray-800 backdrop-blur-sm"
                    >
                        {eventTypeLabels[eventType] || eventType}
                    </Badge>
                    {isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Nổi bật
                        </Badge>
                    )}
                </div>
                <Badge
                    className={`absolute top-3 right-3 ${statusColors[status]}`}
                >
                    {statusLabels[status]}
                </Badge>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {title}
                </h3>
                {/* Đảm bảo mô tả luôn chiếm một dòng và có chiều cao cố định */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-1 min-h-[1.25rem]">
                    {/* {description || "\u00A0"} */}
                    {description || "Thông tin đang được cập nhật"}
                </p>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                            {formatDate(startDate)}
                            {endDate && endDate !== startDate
                                ? ` - ${formatDate(endDate)}`
                                : ""}
                        </span>
                    </div>

                    {startTime && (
                        <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                                {startTime}
                                {endTime ? ` - ${endTime}` : ""}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm truncate">
                            {venueName || "Thông tin đang được cập nhật"}
                        </span>
                    </div>

                    {maxParticipants && (
                        <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                                {currentParticipants || 0}/{maxParticipants}{" "}
                                người tham gia
                            </span>
                        </div>
                    )}
                </div>

                {/* Button conditional rendering dựa trên status */}
                {status === "cancelled" || status === "completed" ? (
                    <Button className="w-full" disabled variant="secondary">
                        {status === "cancelled"
                            ? "Sự kiện đã hủy"
                            : "Sự kiện đã kết thúc"}
                    </Button>
                ) : (
                    <Link href={`/events/${id}`}>
                        <Button className="w-full">
                            {status === "upcoming"
                                ? "Đăng ký tham gia"
                                : "Xem chi tiết"}
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
