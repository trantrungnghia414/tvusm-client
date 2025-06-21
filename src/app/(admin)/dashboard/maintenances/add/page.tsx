// client/src/app/(admin)/dashboard/maintenances/add/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import MaintenanceForm from "../components/MaintenanceForm";
import { CreateMaintenanceDto } from "../types/maintenance";
import { fetchApi } from "@/lib/api";

export default function AddMaintenancePage() {
    const router = useRouter();

    const handleSave = async (data: CreateMaintenanceDto) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/maintenances", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo bảo trì");
            }

            toast.success("Tạo bảo trì thành công");
            router.push("/dashboard/maintenances");
        } catch (error) {
            console.error("Error creating maintenance:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể tạo bảo trì"
            );
            throw error;
        }
    };

    const handleCancel = () => {
        router.push("/dashboard/maintenances");
    };

    return (
        <DashboardLayout activeTab="maintenances">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thêm bảo trì mới
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tạo kế hoạch bảo trì mới cho cơ sở vật chất
                    </p>
                </div>

                {/* Form */}
                <MaintenanceForm onSave={handleSave} onCancel={handleCancel} />
            </div>
        </DashboardLayout>
    );
}
