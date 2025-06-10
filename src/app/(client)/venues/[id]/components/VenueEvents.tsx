"use client";

import { useState, useEffect } from "react";
import { fetchApi, getImageUrl } from "@/lib/api";
import { Calendar, Loader2, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatSEDate } from "@/lib/utils";

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
    current_participants?: number;
    max_participants?: number;
}

interface VenueEventsProps {
    venueId: number;
    onEventCountChange?: (count: number) => void;
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
                    `/events?venue_id=${venueId}&status=upcoming,ongoing`
                );

                if (response.ok) {
                    const data = await response.json();

                    // Sắp xếp sự kiện: "upcoming" trước, "ongoing" sau, và theo ngày bắt đầu
                    const sortedEvents = data.sort((a: Event, b: Event) => {
                        // Ưu tiên theo trạng thái: upcoming trước, ongoing sau
                        if (a.status === "upcoming" && b.status !== "upcoming")
                            return -1;
                        if (a.status !== "upcoming" && b.status === "upcoming")
                            return 1;

                        // Nếu cùng trạng thái, sắp xếp theo ngày gần nhất
                        return (
                            new Date(a.start_date).getTime() -
                            new Date(b.start_date).getTime()
                        );
                    });

                    setEvents(sortedEvents);

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

    // Lấy trạng thái sự kiện và hiển thị dưới dạng badge
    const getEventStatus = (status: string) => {
        switch (status) {
            case "upcoming":
                return (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        Sắp diễn ra
                    </span>
                );
            case "ongoing":
                return (
                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        Đang diễn ra
                    </span>
                );
            case "completed":
                return (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        Đã kết thúc
                    </span>
                );
            case "cancelled":
                return (
                    <span className="bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        Đã hủy
                    </span>
                );
            default:
                return (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
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
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                    Chưa có sự kiện nào
                </h4>
                <p className="text-gray-500 max-w-md mx-auto">
                    Hiện tại chưa có sự kiện nào diễn ra tại nhà thi đấu này.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-bold mb-6">
                Các sự kiện ({events.length})
            </h3>

            <div className="space-y-8">
                {events.map((event) => (
                    <Link
                        href={`/events/${event.event_id}`}
                        key={event.event_id}
                        className="block group"
                    >
                        <div className="bg-white rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col md:flex-row transform">
                            <div className="relative h-60 md:h-56 md:w-2/5 overflow-hidden">
                                <Image
                                    src={getImageUrl(event.image || "")}
                                    alt={event.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    priority={false}
                                />
                                <div className="absolute top-0 inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                <div className="absolute top-3 right-3 z-10">
                                    {getEventStatus(event.status)}
                                </div>
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
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
                            </div>
                            <div className="p-6 md:w-3/5 flex flex-col h-full">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                    {event.title}
                                </h3>
                                <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                                        <span>
                                            {formatSEDate(
                                                event.start_date,
                                                event.end_date
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1.5 text-blue-600" />
                                        <span>{event.venue_name}</span>
                                    </div>
                                    {event.max_participants && (
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                                            <span>
                                                {event.current_participants ||
                                                    0}
                                                /{event.max_participants}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                                    {event.description ||
                                        "Không có mô tả cho sự kiện này."}
                                </p>
                                <div className="pt-2 border-t border-gray-100 flex justify-end">
                                    <div className="text-blue-600 text-sm font-medium inline-flex items-center group-hover:underline">
                                        Xem chi tiết
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
