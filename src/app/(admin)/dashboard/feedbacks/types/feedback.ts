// client/src/app/(admin)/dashboard/feedbacks/types/feedback.ts
export interface Feedback {
    feedback_id: number;
    user_id: number;
    venue_id?: number;
    court_id?: number;
    booking_id?: number;
    rating: number;
    comment: string;
    status: "pending" | "approved" | "rejected";
    response?: string;
    response_date?: string;
    response_by?: number;
    created_at: string;
    updated_at: string;

    // Relations
    user?: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
        avatar?: string;
    };
    venue?: {
        venue_id: number;
        name: string;
        location: string;
    };
    court?: {
        court_id: number;
        name: string;
    };
    booking?: {
        booking_id: number;
        booking_date: string;
        start_time: string;
        end_time: string;
    };
    responder?: {
        user_id: number;
        username: string;
        fullname?: string;
    };
}

export interface FeedbackStats {
    total_feedbacks: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    average_rating: number;
    five_star_count: number;
    four_star_count: number;
    three_star_count: number;
    two_star_count: number;
    one_star_count: number;
    this_month_count: number;
    response_rate: number;
}

export interface CreateFeedbackDto {
    user_id: number;
    venue_id?: number;
    court_id?: number;
    booking_id?: number;
    rating: number;
    comment: string;
}

export interface UpdateFeedbackDto {
    rating?: number;
    comment?: string;
    status?: "pending" | "approved" | "rejected";
    response?: string;
}

export interface FeedbackFilters {
    search: string;
    status: string;
    rating: string;
    venue: string;
    dateFrom?: Date;
    dateTo?: Date;
}

// Options for dropdowns
export interface VenueOption {
    venue_id: number;
    name: string;
    location: string;
}

export interface UserOption {
    user_id: number;
    username: string;
    fullname?: string;
    email: string;
}
