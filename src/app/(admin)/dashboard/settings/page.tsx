// client/src/app/(admin)/dashboard/settings/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Settings,
    Calendar,
    Mail,
    CreditCard,
    Shield,
    Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

// Import components
import GeneralSettingsSection from "./components/GeneralSettingsSection";
import BookingSettingsSection from "./components/BookingSettingsSection";
import EmailSettingsSection from "./components/EmailSettingsSection";
import PaymentSettingsSection from "./components/PaymentSettingsSection";
import SecuritySettingsSection from "./components/SecuritySettingsSection";
import MaintenanceSettingsSection from "./components/MaintenanceSettingsSection";

// Import types
import {
    GeneralSettings,
    BookingSettings,
    EmailSettings,
    PaymentSettings,
    SecuritySettings,
    MaintenanceSettings,
} from "./types/settingsTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    // Settings state
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        site_name: "TVU Sports Hub",
        site_description:
            "Hệ thống quản lý sân thể thao Trường Đại học Trà Vinh",
        timezone: "Asia/Ho_Chi_Minh",
        date_format: "DD/MM/YYYY",
        time_format: "HH:mm",
        language: "vi",
    });

    const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
        max_advance_days: 30,
        min_advance_hours: 2,
        max_booking_duration: 8,
        cancellation_deadline_hours: 24,
        auto_confirmation: false,
        require_deposit: true,
        deposit_percentage: 50,
    });

    const [emailSettings, setEmailSettings] = useState<EmailSettings>({
        smtp_host: "",
        smtp_port: 587,
        smtp_secure: true,
        smtp_user: "",
        smtp_password: "",
        from_email: "",
        from_name: "TVU Sports Hub",
        email_notifications: true,
    });

    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
        payment_methods: ["cash", "bank_transfer"],
        currency: "VND",
        vnpay_enabled: false,
        momo_enabled: false,
        bank_transfer_enabled: true,
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_lowercase: true,
        password_require_numbers: true,
        password_require_symbols: false,
        session_timeout: 60,
        max_login_attempts: 5,
        lockout_duration: 15,
    });

    const [maintenanceSettings, setMaintenanceSettings] =
        useState<MaintenanceSettings>({
            maintenance_mode: false,
            maintenance_message:
                "Hệ thống đang được bảo trì. Vui lòng quay lại sau ít phút.",
            allowed_ips: [],
        });

    // Load settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("Không thể tải cài đặt");
            }

            const data = await response.json();

            // Parse settings data
            if (data.general) setGeneralSettings(data.general);
            if (data.booking) setBookingSettings(data.booking);
            if (data.email) setEmailSettings(data.email);
            if (data.payment) setPaymentSettings(data.payment);
            if (data.security) setSecuritySettings(data.security);
            if (data.maintenance) setMaintenanceSettings(data.maintenance);
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Không thể tải cài đặt hệ thống");
        } finally {
            setLoading(false);
        }
    };

    // Save settings handlers
    const saveGeneralSettings = async (settings: GeneralSettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/general", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setGeneralSettings(settings);
        } catch (error) {
            console.error("Error saving general settings:", error);
            throw error;
        }
    };

    const saveBookingSettings = async (settings: BookingSettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/booking", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setBookingSettings(settings);
        } catch (error) {
            console.error("Error saving booking settings:", error);
            throw error;
        }
    };

    const saveEmailSettings = async (settings: EmailSettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/email", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setEmailSettings(settings);
        } catch (error) {
            console.error("Error saving email settings:", error);
            throw error;
        }
    };

    const savePaymentSettings = async (settings: PaymentSettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/payment", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setPaymentSettings(settings);
        } catch (error) {
            console.error("Error saving payment settings:", error);
            throw error;
        }
    };

    const saveSecuritySettings = async (settings: SecuritySettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/security", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setSecuritySettings(settings);
        } catch (error) {
            console.error("Error saving security settings:", error);
            throw error;
        }
    };

    const saveMaintenanceSettings = async (settings: MaintenanceSettings) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/settings/maintenance", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể lưu cài đặt");
            }

            setMaintenanceSettings(settings);
        } catch (error) {
            console.error("Error saving maintenance settings:", error);
            throw error;
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="settings">
                <LoadingSpinner message="Đang tải cài đặt hệ thống..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="settings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Cài đặt hệ thống
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý cấu hình và thiết lập hệ thống
                        </p>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                        <TabsTrigger
                            value="general"
                            className="flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Chung</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="booking"
                            className="flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Đặt sân</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="email"
                            className="flex items-center gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Email</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="payment"
                            className="flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span className="hidden sm:inline">Thanh toán</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="flex items-center gap-2"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="hidden sm:inline">Bảo mật</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="maintenance"
                            className="flex items-center gap-2"
                        >
                            <Wrench className="w-4 h-4" />
                            <span className="hidden sm:inline">Bảo trì</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <GeneralSettingsSection
                            settings={generalSettings}
                            onSave={saveGeneralSettings}
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="booking">
                        <BookingSettingsSection
                            settings={bookingSettings}
                            onSave={saveBookingSettings}
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="email">
                        <EmailSettingsSection
                            settings={emailSettings}
                            onSave={saveEmailSettings}
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="payment">
                        <PaymentSettingsSection
                            settings={paymentSettings}
                            onSave={savePaymentSettings}
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="security">
                        <SecuritySettingsSection
                            settings={securitySettings}
                            onSave={saveSecuritySettings}
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="maintenance">
                        <MaintenanceSettingsSection
                            settings={maintenanceSettings}
                            onSave={saveMaintenanceSettings}
                            loading={loading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
