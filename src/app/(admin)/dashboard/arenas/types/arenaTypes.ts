export interface SubArena {
    id: number;
    name: string;
    type: string;
    status: "active" | "maintenance" | "inactive";
    capacity?: number;
    equipment?: string[];
}

export interface Arena {
    id: number;
    name: string;
    address: string;
    description: string;
    type:
        | "football"
        | "volleyball"
        | "basketball"
        | "badminton"
        | "tennis"
        | "swimming"
        | "other";
    status: "active" | "maintenance" | "inactive";
    images: string[];
    price_per_hour: number;
    open_time: string;
    close_time: string;
    created_at: string;
    updated_at: string;
    sub_arenas: SubArena[];
    features?: string[];
    rules?: string[];
}

export interface ArenaFilters {
    search: string;
    type: string[];
    status: string[];
    priceRangeFilter: string; // Thay đổi từ priceRange: [number, number] sang priceRangeFilter: string
}
