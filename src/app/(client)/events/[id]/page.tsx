"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import { fetchApi, getImageUrl } from "@/lib/api";
import {
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    Users,
    Trophy,
    Star,
    CheckCircle,
    XCircle,
    PlayCircle,
    CalendarCheck,
    Share2,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

    const formatTime = (timeString: string): string => {
        return timeString.slice(0, 5); // Chỉ lấy HH:MM
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <Navbar />

            <main>
                {loading ? (
                    <div className="min-h-screen flex justify-center items-center">
                        <div className="text-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <div
                                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto"
                                    style={{
                                        animationDirection: "reverse",
                                        animationDuration: "1.5s",
                                    }}
                                ></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Đang tải thông tin sự kiện
                            </h3>
                            <p className="text-gray-500">
                                Vui lòng chờ trong giây lát...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="min-h-screen flex items-center justify-center px-4">
                        <Card className="max-w-md w-full bg-white shadow-xl rounded-3xl overflow-hidden">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Có lỗi xảy ra
                                </h3>
                                <p className="text-red-600 mb-6">{error}</p>
                                <Link href="/events">
                                    <Button className="w-full rounded-xl">
                                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                                        Quay lại trang sự kiện
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                ) : event ? (
                    <>
                        {/* Hero Banner */}
                        <div className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <div
                                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                                    style={{
                                        backgroundImage: `url(${getEventImageUrl(
                                            event.image
                                        )})`,
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                            <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-lg" />

                            {/* Content */}
                            <div className="relative z-10 h-full flex items-center">
                                <div className="container mx-auto px-4">
                                    {/* Breadcrumbs */}
                                    <div className="flex justify-center items-center text-white/70 text-sm mb-8">
                                        <Link
                                            href="/"
                                            className="hover:text-white transition-colors duration-200"
                                        >
                                            Trang chủ
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <Link
                                            href="/events"
                                            className="hover:text-white transition-colors duration-200"
                                        >
                                            Sự kiện
                                        </Link>
                                        <ChevronRight className="h-4 w-4 mx-2" />
                                        <span className="text-white font-medium truncate max-w-[200px]">
                                            {event.title}
                                        </span>
                                    </div>

                                    <div className="text-center max-w-4xl mx-auto">
                                        {/* Status Badge */}
                                        <div className="mb-6">
                                            <Badge
                                                className={`${
                                                    statusColors[event.status]
                                                } text-sm px-4 py-2 font-semibold`}
                                            >
                                                {event.status ===
                                                    "upcoming" && (
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                )}
                                                {event.status === "ongoing" && (
                                                    <PlayCircle className="w-4 h-4 mr-2" />
                                                )}
                                                {event.status ===
                                                    "completed" && (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                )}
                                                {event.status ===
                                                    "cancelled" && (
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                )}
                                                {statusLabels[event.status]}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                            {event.title}
                                        </h1>

                                        {/* Event Type & Featured Badge */}
                                        <div className="flex justify-center items-center gap-3 mb-8">
                                            <Badge
                                                variant="outline"
                                                className="bg-white/10 border-white/20 text-white backdrop-blur-sm px-4 py-2"
                                            >
                                                <Trophy className="w-4 h-4 mr-2" />
                                                {eventTypeLabels[
                                                    event.event_type
                                                ] || event.event_type}
                                            </Badge>

                                            {event.is_featured && (
                                                <Badge className="bg-yellow-500/90 text-yellow-900 border-yellow-400 px-4 py-2 font-semibold">
                                                    <Star className="w-4 h-4 mr-2" />
                                                    Sự kiện nổi bật
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Event Info Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                            {/* Date Card */}
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                                                <div className="flex items-center justify-center mb-2">
                                                    <Calendar className="h-6 w-6 text-blue-300" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-white/70 mb-1">
                                                        Ngày diễn ra
                                                    </p>
                                                    <p className="font-semibold">
                                                        {formatDate(
                                                            event.start_date
                                                        )}
                                                        {event.end_date &&
                                                            event.end_date !==
                                                                event.start_date &&
                                                            ` - ${formatDate(
                                                                event.end_date
                                                            )}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Time Card */}
                                            {event.start_time && (
                                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <Clock className="h-6 w-6 text-green-300" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-white/70 mb-1">
                                                            Thời gian
                                                        </p>
                                                        <p className="font-semibold">
                                                            {formatTime(
                                                                event.start_time
                                                            )}
                                                            {event.end_time &&
                                                                ` - ${formatTime(
                                                                    event.end_time
                                                                )}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location Card */}
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                                                <div className="flex items-center justify-center mb-2">
                                                    <MapPin className="h-6 w-6 text-red-300" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm text-white/70 mb-1">
                                                        Địa điểm
                                                    </p>
                                                    <p className="font-semibold">
                                                        {event.venue_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-center gap-4 mt-8">
                                            <Button
                                                variant="secondary"
                                                size="lg"
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                                            >
                                                <Heart className="w-5 h-5 mr-2" />
                                                Yêu thích
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="lg"
                                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-200"
                                            >
                                                <Share2 className="w-5 h-5 mr-2" />
                                                Chia sẻ
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="container mx-auto px-4 py-12 -mt-20 relative z-20">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Content */}
                                    <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                                        {/* Event Description */}
                                        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                                            <CardContent className="p-8">
                                                <div className="flex items-center mb-6">
                                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4" />
                                                    <h2 className="text-3xl font-bold text-gray-900">
                                                        Thông tin sự kiện
                                                    </h2>
                                                </div>

                                                <div className="prose max-w-none">
                                                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                                                        {event.description ||
                                                            "Thông tin chi tiết về sự kiện sẽ được cập nhật sớm. Hãy theo dõi để không bỏ lỡ những thông tin hấp dẫn nhất!"}
                                                    </div>
                                                </div>

                                                {/* Event Highlights */}
                                                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                                        Điểm nổi bật
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                                                            <span className="text-gray-700">
                                                                Sự kiện{" "}
                                                                {event.is_public
                                                                    ? "công khai"
                                                                    : "riêng tư"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                                                            <span className="text-gray-700">
                                                                Loại:{" "}
                                                                {eventTypeLabels[
                                                                    event
                                                                        .event_type
                                                                ] ||
                                                                    event.event_type}
                                                            </span>
                                                        </div>
                                                        {event.max_participants && (
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                                                                <span className="text-gray-700">
                                                                    Tối đa{" "}
                                                                    {
                                                                        event.max_participants
                                                                    }{" "}
                                                                    người tham
                                                                    gia
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                                                            <span className="text-gray-700">
                                                                Địa điểm:{" "}
                                                                {
                                                                    event.venue_name
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Event Timeline */}
                                        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                                            <CardContent className="p-8">
                                                <div className="flex items-center mb-6">
                                                    <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full mr-4" />
                                                    <h2 className="text-3xl font-bold text-gray-900">
                                                        Lịch trình sự kiện
                                                    </h2>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                                            <CalendarCheck className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                Ngày bắt đầu
                                                            </h4>
                                                            <p className="text-gray-600">
                                                                {formatDate(
                                                                    event.start_date
                                                                )}
                                                            </p>
                                                            {event.start_time && (
                                                                <p className="text-sm text-gray-500">
                                                                    Thời gian:{" "}
                                                                    {formatTime(
                                                                        event.start_time
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {event.end_date &&
                                                        event.end_date !==
                                                            event.start_date && (
                                                            <div className="flex items-start">
                                                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                                                    <Calendar className="w-6 h-6 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">
                                                                        Ngày kết
                                                                        thúc
                                                                    </h4>
                                                                    <p className="text-gray-600">
                                                                        {formatDate(
                                                                            event.end_date
                                                                        )}
                                                                    </p>
                                                                    {event.end_time && (
                                                                        <p className="text-sm text-gray-500">
                                                                            Thời
                                                                            gian:{" "}
                                                                            {formatTime(
                                                                                event.end_time
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Sidebar */}
                                    <div className="lg:col-span-1 space-y-6 order-1 lg:order-2">
                                        {/* Registration Card */}
                                        <div className="sticky top-4 z-20 md:top-6 lg:top-8 transition-all duration-300">
                                            <Card className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white border-0 shadow-xl rounded-3xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] backdrop-blur-sm relative">
                                                {/* Animated background pattern */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-50"></div>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 blur-xl"></div>
                                                <CardContent className="relative p-8">
                                                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                                                        <Users className="w-6 h-6 mr-3" />
                                                        Tham gia sự kiện
                                                    </h3>

                                                    {event.max_participants && (
                                                        <div className="mb-8">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-white/90 font-medium">
                                                                    Số người
                                                                    đăng ký
                                                                </span>
                                                                <span className="text-white font-bold text-lg">
                                                                    {
                                                                        event.current_participants
                                                                    }{" "}
                                                                    /{" "}
                                                                    {
                                                                        event.max_participants
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                                                                <div
                                                                    className="bg-gradient-to-r from-white to-yellow-200 h-3 rounded-full transition-all duration-500 ease-out"
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

                                                            <p className="text-white/80 text-sm">
                                                                <span className="font-semibold">
                                                                    {event.max_participants -
                                                                        event.current_participants}
                                                                </span>{" "}
                                                                chỗ trống còn
                                                                lại
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="space-y-3">
                                                        {event.status ===
                                                            "upcoming" && (
                                                            <Button
                                                                className="w-full bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                                                                size="lg"
                                                            >
                                                                <CalendarCheck className="w-5 h-5 mr-2" />
                                                                Đăng ký tham gia
                                                            </Button>
                                                        )}

                                                        {event.status ===
                                                            "ongoing" && (
                                                            <Button
                                                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                                                                size="lg"
                                                            >
                                                                <PlayCircle className="w-5 h-5 mr-2" />
                                                                Xem chi tiết
                                                            </Button>
                                                        )}

                                                        {event.status ===
                                                            "completed" && (
                                                            <div className="text-center">
                                                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                                                                <p className="text-white/90 font-medium">
                                                                    Sự kiện đã
                                                                    kết thúc
                                                                </p>
                                                            </div>
                                                        )}

                                                        {event.status ===
                                                            "cancelled" && (
                                                            <div className="text-center">
                                                                <XCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
                                                                <p className="text-white/90 font-medium">
                                                                    Sự kiện đã
                                                                    bị hủy
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Event Stats */}
                                        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                                            <CardContent className="p-6">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                    Thống kê sự kiện
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                                                            <span className="text-gray-700">
                                                                Trạng thái
                                                            </span>
                                                        </div>
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    event.status
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                statusLabels[
                                                                    event.status
                                                                ]
                                                            }
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                                        <div className="flex items-center">
                                                            <Users className="w-5 h-5 text-purple-600 mr-2" />
                                                            <span className="text-gray-700">
                                                                Đã đăng ký
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-gray-900">
                                                            {
                                                                event.current_participants
                                                            }{" "}
                                                            người
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                                        <div className="flex items-center">
                                                            <MapPin className="w-5 h-5 text-green-600 mr-2" />
                                                            <span className="text-gray-700">
                                                                Địa điểm
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold text-gray-900 text-right text-sm">
                                                            {event.venue_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Back Button */}
                                <div className="text-center mt-12">
                                    <Link href="/events">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="px-8 py-3 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                                        >
                                            <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                                            Quay lại danh sách sự kiện
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="min-h-screen flex items-center justify-center px-4">
                        <Card className="max-w-md w-full bg-white shadow-xl rounded-3xl overflow-hidden">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Không tìm thấy sự kiện
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Sự kiện bạn đang tìm kiếm không tồn tại hoặc
                                    đã bị xóa.
                                </p>
                                <Link href="/events">
                                    <Button className="w-full rounded-xl">
                                        <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                                        Xem tất cả sự kiện
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
