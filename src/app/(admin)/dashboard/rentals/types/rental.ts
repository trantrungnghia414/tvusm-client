// client/src/app/(admin)/dashboard/rentals/types/rental.ts
export interface Equipment {
    equipment_id: number;
    name: string;
    code: string;
    category_name: string;
    rental_fee: number;
    available_quantity: number;
    status: "available" | "in_use" | "maintenance" | "unavailable";
    image?: string;
}

export interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    phone?: string;
}

export interface Rental {
    rental_id: number;
    user_id: number;
    equipment_id: number;
    quantity: number;
    start_date: string;
    end_date: string;
    total_amount: number;
    status:
        | "pending"
        | "approved"
        | "active"
        | "returned"
        | "cancelled"
        | "overdue";
    payment_status: "pending" | "paid" | "refunded";
    notes?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    equipment?: Equipment;
}

export interface CreateRentalDto {
    user_id?: number;
    equipment_id: number;
    quantity: number;
    start_date: string;
    end_date: string;
    total_amount?: number;
    notes?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
}

export interface RentalStats {
    total_rentals: number;
    active_rentals: number;
    pending_rentals: number;
    overdue_rentals: number;
    total_revenue: number;
    monthly_revenue: number;
    equipment_utilization: number;
}
