"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Calendar, Loader2, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface Event {
    event_id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: string;
    venue_id: number;
    venue_name: string;
    image?: string;
}

interface VenueEventsProps {
    venueId: number;
    onEventCountChange?: (count: number) => void; // Thêm prop callback
}

export default function VenueEvents({
    venueId,
    onEventCountChange,
}: VenueEventsProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                // Chỉ lấy sự kiện đã hoàn thành và đang diễn ra từ API
                const response = await fetchApi(
                    `/events?venue_id=${venueId}&status=completed,ongoing`
                );

                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);

                    // Gọi callback để cập nhật số lượng sự kiện ở component cha
                    if (onEventCountChange) {
                        onEventCountChange(data.length);
                    }
                } else {
                    throw new Error("Không thể tải danh sách sự kiện");
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Đã xảy ra lỗi khi tải danh sách sự kiện");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [venueId, onEventCountChange]);

    // Hàm xử lý URL ảnh
    const getImageUrl = (path: string): string => {
        if (!path) return "/images/placeholder.jpg";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        if (path.startsWith("/uploads")) {
            return `http://localhost:3000${path}`;
        }

        return path;
    };

    // Format date for display
    const formatEventDate = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const isSameDay =
            startDate.getDate() === endDate.getDate() &&
            startDate.getMonth() === endDate.getMonth() &&
            startDate.getFullYear() === endDate.getFullYear();

        const startStr = startDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        if (isSameDay) {
            return startStr;
        } else {
            const endStr = endDate.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            return `${startStr} - ${endStr}`;
        }
    };

    // Get event status display
    const getEventStatus = (status: string) => {
        switch (status) {
            case "upcoming":
                return (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                        Sắp diễn ra
                    </span>
                );
            case "ongoing":
                return (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                        Đang diễn ra
                    </span>
                );
            case "completed":
                return (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full">
                        Đã kết thúc
                    </span>
                );
            case "cancelled":
                return (
                    <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full">
                        Đã hủy
                    </span>
                );
            default:
                return (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full">
                        Không xác định
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                <span>Đang tải danh sách sự kiện...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                    Không có sự kiện nào trong nhà thi đấu này
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-6">
                Các sự kiện ({events.length})
            </h3>
            <div className="space-y-6">
                {events.map((event) => (
                    <Link
                        href={`/events/${event.event_id}`}
                        key={event.event_id}
                    >
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                            <div className="relative h-48 md:h-auto md:w-1/3">
                                <img
                                    src={getImageUrl(event.image || "")}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    {getEventStatus(event.status)}
                                </div>
                            </div>
                            <div className="p-6 md:w-2/3">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 mb-3 text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                                        <span>
                                            {formatEventDate(
                                                event.start_date,
                                                event.end_date
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1.5 text-blue-600" />
                                        <span>{event.venue_name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1.5 text-blue-600" />
                                        <span>
                                            {new Date(
                                                event.start_date
                                            ).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-600 line-clamp-2">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
