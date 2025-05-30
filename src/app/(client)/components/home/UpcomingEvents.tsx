"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "@/app/(client)/components/shared/EventCard";
import { fetchApi, getImageUrl } from "@/lib/api"; // Thêm import getImageUrl

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

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Gọi API thực tế để lấy sự kiện sắp diễn ra và công khai
                // Lấy nhiều hơn 4 sự kiện để có thể lọc và sắp xếp
                const response = await fetchApi(
                    "/events?status=upcoming&is_public=1"
                );

                if (response.ok) {
                    const data = await response.json();
                    // Lọc bỏ sự kiện đã hủy
                    const filteredEvents = data.filter(
                        (event: Event) => event.status !== "cancelled"
                    );

                    // Sắp xếp sự kiện: ưu tiên nổi bật (featured), sau đó đến mới nhất
                    const sortedEvents = filteredEvents.sort(
                        (a: Event, b: Event) => {
                            // Ưu tiên sự kiện nổi bật
                            if (a.is_featured !== b.is_featured) {
                                return a.is_featured ? -1 : 1;
                            }

                            // Nếu cùng trạng thái featured (có thể cả hai đều không nổi bật),
                            // sắp xếp theo ngày tạo hoặc ngày bắt đầu
                            const dateA = a.created_at
                                ? new Date(a.created_at)
                                : new Date(a.start_date);
                            const dateB = b.created_at
                                ? new Date(b.created_at)
                                : new Date(b.start_date);
                            return dateB.getTime() - dateA.getTime();
                        }
                    );

                    // Chỉ lấy 4 sự kiện đầu tiên sau khi sắp xếp
                    setEvents(sortedEvents.slice(0, 4));
                } else {
                    console.error("Failed to fetch events:", response.status);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Sự kiện sắp diễn ra
                    </h2>
                    <p className="text-gray-600">
                        Khám phá và tham gia các sự kiện thể thao hấp dẫn
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

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map((event) => (
                        <EventCard
                            key={event.event_id}
                            id={event.event_id}
                            title={event.title}
                            description={event.description || ""}
                            // Thay đổi cách xử lý ảnh ở đây:
                            image={(() => {
                                const imageUrl = event.image
                                    ? getImageUrl(event.image)
                                    : null;
                                return (
                                    imageUrl || "/images/placeholder.jpg"
                                );
                            })()}
                            startDate={event.start_date}
                            endDate={event.end_date || undefined}
                            startTime={event.start_time || undefined}
                            endTime={event.end_time || undefined}
                            venueName={event.venue_name}
                            status={event.status}
                            maxParticipants={
                                event.max_participants || undefined
                            }
                            currentParticipants={event.current_participants}
                            eventType={event.event_type}
                            isPublic={event.is_public}
                            isFeatured={event.is_featured}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">
                        Không có sự kiện nào sắp diễn ra
                    </p>
                </div>
            )}
        </section>
    );
}
