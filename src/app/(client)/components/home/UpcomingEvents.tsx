"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import EventCard from "@/app/(client)/components/shared/EventCard";
import { fetchApi, getImageUrl } from "@/lib/api";

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
    created_at?: string;
}

export default function UpcomingEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Sửa thành status=upcoming,ongoing để lấy cả sự kiện sắp và đang diễn ra
                const response = await fetchApi(
                    "/events?status=upcoming,ongoing&is_public=1"
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log("Events data:", data); // Thêm log để debug

                    // Lọc bỏ sự kiện đã hủy (nếu có)
                    const filteredEvents = data.filter(
                        (event: Event) => event.status !== "cancelled"
                    );

                    // Sắp xếp sự kiện theo thứ tự ưu tiên:
                    // 1. Đang diễn ra (ongoing)
                    // 2. Sự kiện nổi bật (featured)
                    // 3. Ngày gần nhất
                    const sortedEvents = filteredEvents.sort(
                        (a: Event, b: Event) => {
                            // Ưu tiên sự kiện đang diễn ra
                            if (a.status !== b.status) {
                                return a.status === "ongoing" ? -1 : 1;
                            }

                            // Tiếp theo ưu tiên sự kiện nổi bật
                            if (a.is_featured !== b.is_featured) {
                                return a.is_featured ? -1 : 1;
                            }

                            // Cuối cùng, sắp xếp theo ngày bắt đầu gần nhất
                            const dateA = new Date(a.start_date);
                            const dateB = new Date(b.start_date);
                            return dateA.getTime() - dateB.getTime();
                        }
                    );

                    // Chỉ lấy 4 sự kiện đầu tiên sau khi sắp xếp
                    setEvents(sortedEvents.slice(0, 4));
                } else {
                    console.error("Failed to fetch events:", response.status);
                    setError("Không thể tải dữ liệu từ server");
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                setError("Đã xảy ra lỗi khi tải dữ liệu sự kiện");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Hàm hiển thị tiêu đề phần trên cùng
    const renderSectionTitle = () => {
        return (
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Sự kiện nổi bật
                    </h2>
                    <p className="text-gray-600">
                        Khám phá và tham gia các sự kiện thể thao đang & sắp
                        diễn ra
                    </p>
                </div>
                <Link
                    href="/events"
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    Xem tất cả
                    <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>
        );
    };

    // Hàm hiển thị khi có lỗi
    const renderError = () => {
        if (!error) return null;

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
                <button
                    className="mt-2 text-red-700 underline"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    };

    // Hàm hiển thị khi đang tải
    const renderLoading = () => {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                <span className="text-gray-600">Đang tải sự kiện...</span>
            </div>
        );
    };

    // Hàm hiển thị khi không có sự kiện
    const renderNoEvents = () => {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                    Không có sự kiện nào sắp diễn ra
                </p>
                <p className="text-gray-400 mb-6">
                    Các sự kiện mới sẽ được cập nhật sớm
                </p>
                <Link
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    Đăng ký nhận thông báo
                </Link>
            </div>
        );
    };

    // Hàm hiển thị danh sách sự kiện
    const renderEvents = () => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                    <EventCard
                        key={event.event_id}
                        id={event.event_id}
                        title={event.title}
                        description={event.description || ""}
                        image={(() => {
                            const imageUrl = event.image
                                ? getImageUrl(event.image)
                                : null;
                            return imageUrl || "/images/placeholder.jpg";
                        })()}
                        startDate={event.start_date}
                        endDate={event.end_date || undefined}
                        startTime={event.start_time || undefined}
                        endTime={event.end_time || undefined}
                        venueName={event.venue_name}
                        status={event.status}
                        maxParticipants={event.max_participants || undefined}
                        currentParticipants={event.current_participants}
                        eventType={event.event_type}
                        isPublic={event.is_public}
                        isFeatured={event.is_featured}
                    />
                ))}
            </div>
        );
    };

    return (
        <section className="container mx-auto px-4 py-16">
            {renderSectionTitle()}
            {error && renderError()}

            {loading
                ? renderLoading()
                : events.length > 0
                ? renderEvents()
                : renderNoEvents()}
        </section>
    );
}
