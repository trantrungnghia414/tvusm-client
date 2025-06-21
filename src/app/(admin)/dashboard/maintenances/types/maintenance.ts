// client/src/app/(admin)/dashboard/maintenances/types/maintenance.ts
export interface Maintenance {
    maintenance_id: number;
    title: string;
    description?: string;
    type: "preventive" | "corrective" | "emergency" | "routine";
    priority: "low" | "medium" | "high" | "critical";
    status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "postponed";
    venue_id?: number;
    court_id?: number;
    equipment_id?: number;
    assigned_to?: number;
    estimated_cost?: number;
    actual_cost?: number;
    estimated_duration?: number; // in hours
    actual_duration?: number; // in hours
    scheduled_date: string;
    start_date?: string;
    completion_date?: string;
    notes?: string;
    created_by: number;
    created_at: string;
    updated_at: string;

    // Relations
    venue?: {
        venue_id: number;
        name: string;
        location: string;
    };
    court?: {
        court_id: number;
        name: string;
        venue_name?: string;
    };
    equipment?: {
        equipment_id: number;
        name: string;
        code: string;
        venue_name?: string;
    };
    assigned_user?: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
    };
    creator?: {
        user_id: number;
        username: string;
        fullname?: string;
        email: string;
    };
}

export interface MaintenanceStats {
    total_maintenances: number;
    scheduled_count: number;
    in_progress_count: number;
    completed_count: number;
    overdue_count: number;
    high_priority_count: number;
    total_estimated_cost: number;
    total_actual_cost: number;
    average_completion_time: number;
    this_month_count: number;
    completed_on_time_rate: number;
    preventive_percentage: number;
}

export interface CreateMaintenanceDto {
    title: string;
    description?: string;
    type: Maintenance["type"];
    priority: Maintenance["priority"];
    venue_id?: number;
    court_id?: number;
    equipment_id?: number;
    assigned_to?: number;
    estimated_cost?: number;
    estimated_duration?: number;
    scheduled_date: string;
    notes?: string;
}

export interface UpdateMaintenanceDto {
    title?: string;
    description?: string;
    type?: Maintenance["type"];
    priority?: Maintenance["priority"];
    status?: Maintenance["status"];
    venue_id?: number;
    court_id?: number;
    equipment_id?: number;
    assigned_to?: number;
    estimated_cost?: number;
    actual_cost?: number;
    estimated_duration?: number;
    actual_duration?: number;
    scheduled_date?: string;
    start_date?: string;
    completion_date?: string;
    notes?: string;
}

// Interface cho dropdown data
export interface VenueOption {
    venue_id: number;
    name: string;
    location: string;
}

export interface CourtOption {
    court_id: number;
    name: string;
    venue_id: number;
    venue_name: string;
}

export interface EquipmentOption {
    equipment_id: number;
    name: string;
    code: string;
    venue_id: number;
    venue_name: string;
}

export interface UserOption {
    user_id: number;
    username: string;
    fullname?: string;
    email: string;
    role: string;
}
