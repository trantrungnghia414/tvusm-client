// client/src/app/(client)/pricing/types/pricingTypes.ts
export interface CourtPricing {
    court_id: number;
    name: string;
    type_name: string;
    venue_name: string;
    hourly_rate: number;
    peak_rate?: number; // Giá giờ cao điểm
    weekend_rate?: number; // Giá cuối tuần
    description?: string;
    image?: string;
    is_indoor: boolean;
    surface_type?: string;
    amenities?: string[];
    discount_percentage?: number;
}

export interface ServicePricing {
    service_id: number;
    name: string;
    category: "equipment" | "facility" | "coaching" | "other";
    price: number;
    unit: "hour" | "day" | "session" | "piece";
    description: string;
    image?: string;
    features?: string[];
    popular?: boolean;
}

export interface PricingPromotion {
    promotion_id: number;
    title: string;
    description: string;
    discount_percentage: number;
    valid_from: string;
    valid_to: string;
    applicable_to: "courts" | "services" | "all";
    conditions?: string[];
}

export interface PricingFAQItem {
    question: string;
    answer: string;
    category: "general" | "booking" | "payment" | "cancellation";
}

export type PricingTab = "courts" | "services" | "promotions";
