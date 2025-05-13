export interface Venue {
    venue_id: number;
    name: string;
    location: string;
    description?: string;
    capacity?: number;
    status: "active" | "maintenance" | "inactive";
    image?: string | null;
    created_at: string;
    updated_at: string;
}

export interface VenueFormValues {
    name: string;
    location: string;
    description: string;
    capacity: string;
    status: "active" | "maintenance" | "inactive";
}
