// client/src/app/(admin)/dashboard/notifications/types/notification.ts
export interface Notification {
    notification_id: number;
    user_id: number;
    title: string;
    message: string;
    type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "booking"
        | "payment"
        | "system";
    is_read: boolean;
    data?: NotificationData; // ✅ Thay thế any bằng type cụ thể
    created_at: string;
    updated_at: string;
}

export interface NotificationStats {
    total: number;
    unread: number;
}

// ✅ Định nghĩa type cụ thể cho data của notification
export interface NotificationData {
    // Common fields
    link?: string;

    // Booking related
    booking_id?: number;
    booking_date?: string;
    court_name?: string;
    venue_name?: string;

    // Payment related
    payment_id?: number;
    amount?: number;
    payment_method?: string;

    // User related
    user_id?: number;
    username?: string;

    // Event related
    event_id?: number;
    event_title?: string;

    // News related
    news_id?: number;
    news_title?: string;

    // System related
    maintenance_type?: string;
    affected_services?: string[];
    estimated_duration?: string;

    // General metadata
    priority?: "low" | "medium" | "high" | "urgent";
    category?: string;
    tags?: string[];

    // Additional dynamic data (for future extensibility)
    [key: string]: string | number | boolean | string[] | undefined;
}

// ✅ Type guards để kiểm tra loại notification data
export const isBookingNotification = (
    data?: NotificationData
): data is NotificationData & { booking_id: number } => {
    return data?.booking_id !== undefined;
};

export const isPaymentNotification = (
    data?: NotificationData
): data is NotificationData & { payment_id: number } => {
    return data?.payment_id !== undefined;
};

export const isEventNotification = (
    data?: NotificationData
): data is NotificationData & { event_id: number } => {
    return data?.event_id !== undefined;
};

export const isNewsNotification = (
    data?: NotificationData
): data is NotificationData & { news_id: number } => {
    return data?.news_id !== undefined;
};

// ✅ Helper functions để tạo notification data
export const createBookingNotificationData = (
    bookingId: number,
    options?: Partial<NotificationData>
): NotificationData => ({
    booking_id: bookingId,
    link: `/dashboard/bookings/${bookingId}`,
    ...options,
});

export const createPaymentNotificationData = (
    paymentId: number,
    amount?: number,
    options?: Partial<NotificationData>
): NotificationData => ({
    payment_id: paymentId,
    amount,
    link: `/dashboard/payments/${paymentId}`,
    ...options,
});

export const createEventNotificationData = (
    eventId: number,
    eventTitle?: string,
    options?: Partial<NotificationData>
): NotificationData => ({
    event_id: eventId,
    event_title: eventTitle,
    link: `/dashboard/events/${eventId}`,
    ...options,
});

export const createNewsNotificationData = (
    newsId: number,
    newsTitle?: string,
    options?: Partial<NotificationData>
): NotificationData => ({
    news_id: newsId,
    news_title: newsTitle,
    link: `/dashboard/news/${newsId}`,
    ...options,
});

export const createSystemNotificationData = (
    maintenanceType?: string,
    options?: Partial<NotificationData>
): NotificationData => ({
    maintenance_type: maintenanceType,
    priority: "high",
    ...options,
});

// ✅ DTO interface cho tạo notification
export interface CreateNotificationDto {
    user_id?: number; // If not provided, will be broadcast to all admins
    title: string;
    message: string;
    type: Notification["type"];
    data?: NotificationData;
}
