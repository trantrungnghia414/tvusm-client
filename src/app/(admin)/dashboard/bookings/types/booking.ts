// client/src/types/booking.ts
export interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    full_name?: string; // Thêm trường này để tương thích
    name?: string; // Thêm trường này để tương thích
    phone?: string;
    avatar?: string; // ✅ Thêm avatar field
}

export interface Booking {
    booking_id: number;
    user_id: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    payment_status: "unpaid" | "partial" | "paid" | "refunded";
    notes: string;
    created_at: string;
    updated_at: string;

    // Thông tin khách hàng trực tiếp (cho khách vãng lai)
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;

    // Thông tin người thuê (từ backend entity)
    renter_name?: string;
    renter_phone?: string;
    renter_email?: string;

    // Relations
    user?: User;
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
    today_bookings: number; // Số booking có ngày chơi là hôm nay (dựa trên field date)
    today_bookings_created: number; // Số booking được tạo hôm nay (dựa trên created_at)
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
    payment_status?: "unpaid" | "partial" | "paid" | "refunded";
    notes?: string;
}
