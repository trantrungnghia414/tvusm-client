"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import { fetchApi, getImageUrl } from "@/lib/api";
import { Loader2, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

// Định nghĩa interface cho Event - sử dụng lại từ EventList để đồng nhất
interface Event {
    event_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    venue_id: number;
    venue_name: string;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    max_participants: number | null;
    current_participants: number;
    event_type: string;
    image: string | null;
    is_public: boolean;
    is_featured: boolean;
}

export default function EventDetailPage() {
    // const router = useRouter();
    const { id } = useParams() as { id: string };
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const fetchEventDetail = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const eventId = parseInt(id as string);
            if (isNaN(eventId)) {
                throw new Error("ID sự kiện không hợp lệ");
            }

            const response = await fetchApi(`/events/${eventId}`);

            if (!response.ok) {
                throw new Error("Không thể tải thông tin sự kiện");
            }

            const data = await response.json();
            setEvent(data);
        } catch (error) {
            console.error("Error fetching event details:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "Đã xảy ra lỗi khi tải thông tin sự kiện"
            );
            toast.error("Đã xảy ra lỗi khi tải thông tin sự kiện");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEventDetail();
    }, [fetchEventDetail]);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

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

    // Hàm xử lý URL ảnh với kiểm soát lỗi chặt chẽ hơn
    const getEventImageUrl = (path: string | null): string => {
        if (!path) return "/images/event-placeholder.jpg";

        const imageUrl = getImageUrl(path);
        return imageUrl || "/images/event-placeholder.jpg";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="py-8">
                {loading ? (
                    <div className="container mx-auto px-4 flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <span className="ml-2 text-gray-600">
                            Đang tải thông tin sự kiện...
                        </span>
                    </div>
                ) : error ? (
                    <div className="container mx-auto px-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Link href="/events">
                                <Button>Quay lại trang sự kiện</Button>
                            </Link>
                        </div>
                    </div>
                ) : event ? (
                    <>
                        {/* Banner */}
                        <div className="w-full h-64 md:h-96 relative bg-gray-900">
                            <div className="absolute inset-0 overflow-hidden">
                                <img
                                    src={getEventImageUrl(event.image)}
                                    alt={event.title}
                                    className="w-full h-full object-cover opacity-70"
                                />
                            </div>

                            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
                                <div className="container mx-auto px-4 text-center">
                                    {/* Breadcrumbs */}
                                    <div className="flex justify-center items-center text-white/80 text-sm mb-6">
                                        <Link
                                            href="/"
                                            className="hover:text-white"
                                        >
                                            Trang chủ
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <Link
                                            href="/events"
                                            className="hover:text-white"
                                        >
                                            Sự kiện
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <span className="text-white font-medium truncate max-w-[180px]">
                                            {event.title}
                                        </span>
                                    </div>

                                    <Badge
                                        className={`${
                                            statusColors[event.status]
                                        } mb-3`}
                                    >
                                        {statusLabels[event.status]}
                                    </Badge>

                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                                        {event.title}
                                    </h1>

                                    <div className="flex flex-wrap justify-center gap-4 text-white">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-2" />
                                            <span>
                                                {formatDate(event.start_date)}
                                                {event.end_date &&
                                                    event.end_date !==
                                                        event.start_date &&
                                                    ` - ${formatDate(
                                                        event.end_date
                                                    )}`}
                                            </span>
                                        </div>

                                        {event.start_time && (
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 mr-2" />
                                                <span>
                                                    {event.start_time}
                                                    {event.end_time &&
                                                        ` - ${event.end_time}`}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            <span>{event.venue_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="container mx-auto px-4 py-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-wrap gap-3 mb-6">
                                            <Badge
                                                variant="outline"
                                                className="bg-gray-100"
                                            >
                                                {eventTypeLabels[
                                                    event.event_type
                                                ] || event.event_type}
                                            </Badge>

                                            {event.is_featured && (
                                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                                    Nổi bật
                                                </Badge>
                                            )}
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Thông tin sự kiện
                                        </h2>

                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 whitespace-pre-line">
                                                {event.description ||
                                                    "Không có thông tin chi tiết."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin tham gia */}
                                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                                    <div className="p-6 md:p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Thông tin tham gia
                                        </h2>

                                        {event.max_participants && (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-700 font-medium">
                                                        Số người tham gia
                                                    </span>
                                                    <span className="text-blue-600 font-semibold">
                                                        {
                                                            event.current_participants
                                                        }{" "}
                                                        /{" "}
                                                        {event.max_participants}
                                                    </span>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                (event.current_participants /
                                                                    event.max_participants) *
                                                                    100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {event.max_participants -
                                                        event.current_participants}{" "}
                                                    chỗ trống còn lại
                                                </p>
                                            </div>
                                        )}

                                        {event.status === "upcoming" && (
                                            <Button
                                                className="w-full sm:w-auto"
                                                size="lg"
                                            >
                                                Đăng ký tham gia
                                            </Button>
                                        )}

                                        {event.status === "ongoing" && (
                                            <Button
                                                className="w-full sm:w-auto"
                                                size="lg"
                                            >
                                                Xem chi tiết
                                            </Button>
                                        )}

                                        {(event.status === "completed" ||
                                            event.status === "cancelled") && (
                                            <p className="text-gray-500">
                                                {event.status === "completed"
                                                    ? "Sự kiện này đã kết thúc."
                                                    : "Sự kiện này đã bị hủy."}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Link href="/events">
                                        <Button variant="outline">
                                            Quay lại danh sách sự kiện
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="container mx-auto px-4 py-16 text-center">
                        <p className="text-gray-500">
                            Không tìm thấy thông tin sự kiện
                        </p>
                        <Link
                            href="/events"
                            className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                            Quay lại danh sách sự kiện
                        </Link>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
