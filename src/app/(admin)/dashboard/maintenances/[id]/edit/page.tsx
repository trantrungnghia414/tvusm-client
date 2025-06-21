// client/src/app/(admin)/dashboard/maintenances/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import MaintenanceForm from "../../components/MaintenanceForm";
import { Maintenance, UpdateMaintenanceDto } from "../../types/maintenance";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function EditMaintenancePage() {
    const router = useRouter();
    const params = useParams();
    const maintenanceId = params.id as string;

    const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(
                    `/maintenances/${maintenanceId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin bảo trì");
                }

                const data = await response.json();
                setMaintenance(data);
            } catch (error) {
                console.error("Error fetching maintenance:", error);
                toast.error("Không thể tải thông tin bảo trì");
                router.push("/dashboard/maintenances");
            } finally {
                setLoading(false);
            }
        };

        if (maintenanceId) {
            fetchMaintenance();
        }
    }, [maintenanceId, router]);

    const handleSave = async (data: UpdateMaintenanceDto) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/maintenances/${maintenanceId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật bảo trì"
                );
            }

            toast.success("Cập nhật bảo trì thành công");
            router.push("/dashboard/maintenances");
        } catch (error) {
            console.error("Error updating maintenance:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật bảo trì"
            );
            throw error;
        }
    };

    const handleCancel = () => {
        router.push("/dashboard/maintenances");
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="maintenances">
                <LoadingSpinner message="Đang tải thông tin bảo trì..." />
            </DashboardLayout>
        );
    }

    if (!maintenance) {
        return (
            <DashboardLayout activeTab="maintenances">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy bảo trì
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Bảo trì này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/maintenances")}
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="maintenances">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Chỉnh sửa bảo trì #
                        {maintenance.maintenance_id.toString().padStart(6, "0")}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Cập nhật thông tin kế hoạch bảo trì
                    </p>
                </div>

                {/* Form */}
                <MaintenanceForm
                    maintenance={maintenance}
                    isEdit={true}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </DashboardLayout>
    );
}
