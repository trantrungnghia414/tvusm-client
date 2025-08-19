export interface Court {
    court_id: number;
    venue_id: number;
    type_id: number;
    venue_name?: string;
    type_name?: string;
    name: string;
    code: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image?: string | null;
    description?: string | null;
    is_indoor: boolean;
    // ✅ Thêm trường court_level cho việc mapping sân
    court_level?: number;
    // ✅ Thêm trường sub_court_count cho số lượng sân con
    sub_court_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CourtType {
    type_id: number;
    name: string;
    description: string | null;
    standard_size: string | null;
}

export interface Venue {
    venue_id: number;
    name: string;
}
