// client/src/types/booking.ts
export interface Booking {
    booking_id: number;
    user_id: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    payment_status: "pending" | "paid" | "refunded";
    notes?: string;
    created_at: string;
    updated_at: string;

    // Relations
    user?: {
        user_id: number;
        username: string;
        email: string;
        fullname?: string;
        phone?: string;
    };
    court?: {
        court_id: number;
        name: string;
        type_name: string;
        venue_name: string;
        hourly_rate: number;
    };
}

export interface BookingStats {
    total_bookings: number;
    today_bookings: number;
    pending_bookings: number;
    total_revenue: number;
    monthly_revenue: number;
    completion_rate: number;
}

export interface CreateBookingDto {
    user_id?: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    total_amount?: number;
    notes?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
}

export interface UpdateBookingDto {
    date?: string;
    start_time?: string;
    end_time?: string;
    status?: "pending" | "confirmed" | "completed" | "cancelled";
    payment_status?: "pending" | "paid" | "refunded";
    notes?: string;
}
