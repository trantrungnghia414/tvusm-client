// client/src/app/(admin)/dashboard/settings/types/settingsTypes.ts
export interface SystemSetting {
    setting_id: number;
    setting_key: string;
    setting_value: string | number | boolean | object | null;
    description?: string;
    updated_at: string;
    updated_by?: number;
}

export interface GeneralSettings {
    site_name: string;
    site_description: string;
    site_logo?: string;
    timezone: string;
    date_format: string;
    time_format: string;
    language: string;
}

export interface BookingSettings {
    max_advance_days: number;
    min_advance_hours: number;
    max_booking_duration: number;
    cancellation_deadline_hours: number;
    auto_confirmation: boolean;
    require_deposit: boolean;
    deposit_percentage: number;
}

export interface EmailSettings {
    smtp_host: string;
    smtp_port: number;
    smtp_secure: boolean;
    smtp_user: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
    email_notifications: boolean;
}

export interface PaymentSettings {
    payment_methods: string[];
    currency: string;
    vnpay_enabled: boolean;
    vnpay_merchant_id?: string;
    momo_enabled: boolean;
    momo_partner_code?: string;
    bank_transfer_enabled: boolean;
    bank_info?: string;
}

export interface SecuritySettings {
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    session_timeout: number;
    max_login_attempts: number;
    lockout_duration: number;
}

export interface MaintenanceSettings {
    maintenance_mode: boolean;
    maintenance_message: string;
    allowed_ips: string[];
}