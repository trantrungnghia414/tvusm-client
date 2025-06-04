import React from "react";
import EventCard from "@/app/(client)/components/shared/EventCard";
import { getImageUrl } from "@/lib/api";
import EventSkeleton from "@/app/(client)/events/components/EventSkeleton";
import NoEvents from "@/app/(client)/events/components/NoEvents";

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

interface EventListProps {
    events: Event[];
    loading: boolean;
    error: string | null;
}

export default function EventList({ events, loading, error }: EventListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <EventSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                    onClick={() => window.location.reload()}
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (events.length === 0) {
        return <NoEvents />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <EventCard
                    key={event.event_id}
                    id={event.event_id}
                    title={event.title}
                    description={event.description || ""}
                    image={
                        event.image
                            ? getImageUrl(event.image) ||
                              "/images/event-placeholder.jpg"
                            : "/images/event-placeholder.jpg"
                    }
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
}
