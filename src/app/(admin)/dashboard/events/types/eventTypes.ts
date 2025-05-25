export interface Event {
    event_id: number;
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    start_time?: string;
    end_time?: string;
    venue_id?: number;
    court_id?: number;
    organizer_id: number;
    organizer_name?: string; // Thêm trường này
    status: "upcoming" | "ongoing" | "completed" | "cancelled";
    max_participants?: number;
    current_participants: number;
    event_type: string;
    image?: string;
    is_public: boolean;
    is_featured: boolean;
    registration_deadline?: string;
    created_at: string;
    updated_at: string;
    venue_name?: string;
    court_name?: string;
    venue?: {
        venue_id: number;
        name: string;
    };
    court?: {
        court_id: number;
        name: string;
    };
    organizer?: {
        user_id: number;
        username: string;
        fullname?: string;
    };
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
