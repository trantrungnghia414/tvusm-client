export interface Equipment {
    equipment_id: number;
    name: string;
    code: string;
    category_id: number;
    category_name?: string;
    quantity: number;
    available_quantity: number;
    status: "available" | "in_use" | "maintenance" | "unavailable";
    description: string | null;
    purchase_date: string | null;
    purchase_price: number | null;
    rental_fee: number;
    venue_id: number | null;
    venue_name?: string;
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
