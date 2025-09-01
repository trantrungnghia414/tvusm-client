// client/src/app/(admin)/dashboard/payments/types/payment.ts
export interface Payment {
    payment_id: number;
    booking_id?: number;
    rental_id?: number;
    user_id: number;
    amount: number;
    payment_method: "cash" | "bank_transfer" | "vnpay" | "momo";
    status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
    transaction_id?: string;
    gateway_response?: string;
    notes?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;

    // Relations
    user?: {
        user_id: number;
        username: string;
        email: string;
        fullname?: string;
        phone?: string;
    };
    booking?: {
        booking_id: number;
        court_name: string;
        booking_date: string;
        start_time: string;
        end_time: string;
        court?: {
            court_id: number;
            name: string;
            code: string;
            type_id: number;
        };
    };
    rental?: {
        rental_id: number;
        equipment_name: string;
        start_date: string;
        end_date: string;
        quantity: number;
    };
}

export interface PaymentStats {
    total_payments: number;
    total_amount: number;
    pending_payments: number;
    pending_amount: number;
    completed_payments: number;
    completed_amount: number;
    failed_payments: number;
    refunded_amount: number;
    today_revenue: number;
    monthly_revenue: number;
    cash_payments: number;
    online_payments: number;
}

export interface CreatePaymentDto {
    booking_id?: number;
    rental_id?: number;
    user_id: number;
    amount: number;
    payment_method: Payment["payment_method"];
    transaction_id?: string;
    notes?: string;
}

export interface UpdatePaymentDto {
    status?: Payment["status"];
    transaction_id?: string;
    gateway_response?: string;
    notes?: string;
    paid_at?: string;
}
