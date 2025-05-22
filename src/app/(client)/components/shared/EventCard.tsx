import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const eventTypeLabels: Record<string, string> = {
        competition: "Giải đấu",
        training: "Tập luyện",
        friendly: "Giao hữu",
        school_event: "Sự kiện trường",
        other: "Khác",
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={
                        image ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                    }
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {description}
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
                        <span className="text-sm truncate">{venueName}</span>
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

                <Link href={`/events/${id}`}>
                    <Button
                        className="w-full"
                        disabled={
                            status === "cancelled" || status === "completed"
                        }
                    >
                        {status === "upcoming"
                            ? "Đăng ký tham gia"
                            : "Xem chi tiết"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
