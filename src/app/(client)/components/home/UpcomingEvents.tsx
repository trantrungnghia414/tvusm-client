"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "@/app/(client)/components/shared/EventCard";
// import { fetchApi } from "@/lib/api";
// import EventCard from "../shared/EventCard";

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

export default function UpcomingEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Giả lập dữ liệu vì chưa có API thực
                setEvents([
                    {
                        event_id: 1,
                        title: "Giải bóng đá sinh viên TVU 2025",
                        description:
                            "Giải đấu bóng đá thường niên dành cho sinh viên Trường Đại học Trà Vinh",
                        start_date: "2025-06-15",
                        end_date: "2025-06-20",
                        start_time: "08:00",
                        end_time: "17:00",
                        venue_id: 4,
                        venue_name: "Sân bóng đá TVU",
                        status: "upcoming",
                        max_participants: 32,
                        current_participants: 24,
                        event_type: "competition",
                        image: "/images/event-1.jpg",
                        is_public: true,
                        is_featured: true,
                    },
                    {
                        event_id: 2,
                        title: "Giải cầu lông mở rộng TVU 2025",
                        description:
                            "Giải cầu lông dành cho sinh viên và cán bộ nhân viên Trường Đại học Trà Vinh",
                        start_date: "2025-06-10",
                        end_date: "2025-06-12",
                        start_time: "09:00",
                        end_time: "17:00",
                        venue_id: 2,
                        venue_name: "Nhà Thi Đấu TVU",
                        status: "upcoming",
                        max_participants: 64,
                        current_participants: 48,
                        event_type: "competition",
                        image: "/images/event-2.jpg",
                        is_public: true,
                        is_featured: true,
                    },
                    {
                        event_id: 3,
                        title: "Buổi tập luyện bóng rổ TVU",
                        description:
                            "Buổi tập luyện và giao lưu bóng rổ dành cho sinh viên yêu thích môn thể thao này",
                        start_date: "2025-06-05",
                        end_date: null,
                        start_time: "15:00",
                        end_time: "17:00",
                        venue_id: 2,
                        venue_name: "Nhà Thi Đấu TVU",
                        status: "upcoming",
                        max_participants: 30,
                        current_participants: 12,
                        event_type: "training",
                        image: "/images/event-3.jpg",
                        is_public: true,
                        is_featured: false,
                    },
                    {
                        event_id: 4,
                        title: "Giao lưu bóng chuyền các khoa",
                        description:
                            "Sự kiện giao lưu bóng chuyền giữa các khoa trong trường đại học",
                        start_date: "2025-06-08",
                        end_date: "2025-06-09",
                        start_time: "14:00",
                        end_time: "18:00",
                        venue_id: 2,
                        venue_name: "Nhà Thi Đấu TVU",
                        status: "upcoming",
                        max_participants: 40,
                        current_participants: 32,
                        event_type: "friendly",
                        image: "/images/event-4.jpg",
                        is_public: true,
                        is_featured: false,
                    },
                ]);
                setLoading(false);

                // Đoạn code gọi API thực tế (comment lại vì chưa có API)
                /*
        const response = await fetchApi('/events?status=upcoming&limit=4');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
        */
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                    <EventCard
                        key={event.event_id}
                        id={event.event_id}
                        title={event.title}
                        description={event.description || ""}
                        image={event.image || "/images/event-placeholder.jpg"}
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
        </section>
    );
}
