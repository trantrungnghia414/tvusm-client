// import { Court } from "../courts/types/courtTypes";

export interface CourtMapping {
    mapping_id: number;
    parent_court_id: number;
    child_court_id: number;
    position: string | null;
    created_at: string;

    // Trường mở rộng cho hiển thị
    parent_court_name?: string;
    parent_court_code?: string;
    child_court_name?: string;
    child_court_code?: string;
}

export interface CourtMappingFormData {
    parent_court_id: number;
    child_court_id: number;
    position: string | null;
}
