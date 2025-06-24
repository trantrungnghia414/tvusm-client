// client/src/app/(admin)/dashboard/activity-log/types/activityTypes.ts
export interface ActivityLogItem {
    id: string;
    type:
        | "booking"
        | "payment"
        | "user"
        | "maintenance"
        | "system"
        | "event"
        | "news"
        | "venue";
    action:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "cancel"
        | "approve"
        | "reject";
    description: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        role: string;
    };
    target?: {
        id: string;
        name: string;
        type: string;
    };
    metadata?: Record<
        string,
        string | number | boolean | string[] | null | undefined
    >;
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    severity: "low" | "medium" | "high" | "critical";
}

// ✅ Sửa lỗi: Sử dụng DateRange compatible với react-day-picker
export interface DateRangeType {
    from: Date;
    to: Date;
}

export interface ActivityLogFilters {
    type?: string;
    action?: string;
    userId?: string;
    dateRange?: DateRangeType; // Giữ nguyên để tương thích
    severity?: string;
    search?: string;
}

export interface ActivityLogStats {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
}

// ✅ Thêm interface cho các loại metadata cụ thể
export interface BookingMetadata {
    venue?: string;
    court?: string;
    time?: string;
    amount?: string;
    booking_id?: string;
    duration?: string;
}

export interface PaymentMetadata {
    amount?: string;
    method?: string;
    booking_id?: string;
    transaction_id?: string;
    status?: string;
}

export interface UserMetadata {
    previous_role?: string;
    new_role?: string;
    login_method?: string;
    session_duration?: string;
}

export interface SystemMetadata {
    setting?: string;
    old_value?: string;
    new_value?: string;
    module?: string;
    affected_users?: string[];
}

export interface MaintenanceMetadata {
    equipment_id?: string;
    maintenance_type?: string;
    priority?: string;
    estimated_duration?: string;
    assigned_to?: string;
}

export interface EventMetadata {
    event_type?: string;
    participants_count?: number;
    venue?: string;
    registration_deadline?: string;
}

export interface NewsMetadata {
    category?: string;
    published_status?: string;
    view_count?: number;
    is_featured?: boolean;
}

export interface VenueMetadata {
    capacity?: number;
    facility_type?: string;
    location?: string;
    status_change?: string;
}

// ✅ Union type cho tất cả metadata types
export type ActivityMetadata =
    | BookingMetadata
    | PaymentMetadata
    | UserMetadata
    | SystemMetadata
    | MaintenanceMetadata
    | EventMetadata
    | NewsMetadata
    | VenueMetadata
    | Record<string, string | number | boolean | string[] | null | undefined>;
