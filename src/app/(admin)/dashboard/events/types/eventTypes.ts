export interface Event {
    event_id: number;
    title: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    venue_id: number;
    venue_name?: string;
    court_id: number | null;
    court_name?: string;
    organizer_id: number;
    organizer_name?: string;
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    max_participants: number | null;
    current_participants: number;
    event_type:
        | "competition"
        | "training"
        | "friendly"
        | "school_event"
        | "other";
    image: string | null;
    is_public: boolean;
    is_featured: boolean;
    registration_deadline: string | null;
    created_at: string;
    updated_at: string;
}

export interface Participant {
    id: number;
    user_id: number;
    username: string;
    fullname: string | null;
    email: string | null;
    student_id: string | null;
    registration_date: string;
    status: "registered" | "confirmed" | "attended" | "cancelled";
    avatar?: string | null;
}

export interface EventStats {
    totalEvents: number;
    upcomingEvents: number;
    ongoingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    featuredEvents: number;
    mostPopularEvent?: {
        title: string;
        participants: number;
    };
}

export interface EventFilters {
    searchTerm: string;
    statusFilter: string;
    typeFilter: string;
    venueFilter: string;
    dateFilter: string;
}
