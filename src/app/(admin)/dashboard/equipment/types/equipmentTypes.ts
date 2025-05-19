// Kiểu dữ liệu cho thiết bị
export interface Equipment {
    equipment_id: number;
    name: string;
    code: string;
    category_id: number;
    category_name?: string;
    venue_id?: number | null;
    venue_name?: string;
    quantity: number;
    available_quantity: number;
    status: "available" | "in_use" | "maintenance" | "unavailable";
    description?: string;
    image?: string | null;
    purchase_date?: string | null;
    purchase_price?: number | null;
    rental_fee: number;
    created_at?: string;
    updated_at?: string;
}

// Kiểu dữ liệu cho danh mục thiết bị
export interface EquipmentCategory {
    category_id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

// Kiểu dữ liệu cho form thêm/sửa thiết bị
export interface EquipmentFormData {
    name: string;
    code: string;
    category_id: number;
    venue_id?: number | null;
    quantity: number;
    available_quantity: number;
    status: string;
    description?: string;
    purchase_date?: string;
    purchase_price?: number;
    rental_fee: number;
    image?: File;
}

// Thống kê thiết bị
export interface EquipmentStats {
    totalEquipment: number;
    availableEquipment: number;
    maintenanceEquipment: number;
    unavailableEquipment: number;
    inUseEquipment: number;
}

// Response từ API
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface Venue {
    venue_id: number;
    name: string;
    location: string;
    capacity?: number;
    description?: string;
    status: string;
    image?: string;
    created_at: string;
    updated_at: string;
}
