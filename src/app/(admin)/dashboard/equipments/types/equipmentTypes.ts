export interface Equipment {
    equipment_id: number;
    name: string;
    code: string;
    category_id: number;
    category_name?: string;
    status: "available" | "in_use" | "maintenance" | "unavailable";
    description: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    venue_id: number | null;
    venue_name?: string;
    court_id: number | null;
    court_name?: string;
    court_code?: string;
    location_detail: string | null;
    serial_number: string | null;
    manufacturer: string | null;
    model: string | null;
    warranty_expiry: string | null;
    last_maintenance_date: string | null;
    next_maintenance_date: string | null;
    installation_date: string | null;
    qr_code: string | null;
    notes: string | null;
    image: string | null;
    created_at: string;
    updated_at: string;
    added_by_name?: string;
}

export interface EquipmentCategory {
    category_id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export interface EquipmentStats {
    total: number;
    available: number;
    in_use: number;
    maintenance: number;
    unavailable: number;
    categories_count: number;
    total_value: number;
}
