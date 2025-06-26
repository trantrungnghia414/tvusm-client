// client/src/app/(admin)/dashboard/notifications/types/notification.ts
export interface NotificationUser {
    user_id: number;
    username?: string;
    email?: string;
    fullname?: string;
}

export interface Notification {
    notification_id: number;
    user_id: number;
    title: string;
    message: string;
    type:
        | "booking"
        | "payment"
        | "event"
        | "system"
        | "success"
        | "warning"
        | "error"
        | "info";
    is_read: boolean;
    created_at: string;
    reference_id?: number;
    data?: {
        link?: string;
        booking_id?: number;
        booking_code?: string;
        court_name?: string;
        venue_name?: string;
        payment_id?: number;
        amount?: number;
        payment_method?: string;
        event_id?: number;
        event_title?: string;
        user_id?: number;
        username?: string;
        priority?: "low" | "medium" | "high" | "urgent";
        category?: string;
        tags?: string[];
        [key: string]: string | number | boolean | string[] | undefined;
    };
    user?: NotificationUser; // ✅ Thêm thông tin user cho admin view
}

export interface NotificationStats {
    total: number;
    unread: number;
    read?: number;
    today?: number;
    byType?: Record<string, number>;
    mostActiveUsers?: Array<{
        user_id: number;
        username: string;
        notification_count: number;
    }>;
}
