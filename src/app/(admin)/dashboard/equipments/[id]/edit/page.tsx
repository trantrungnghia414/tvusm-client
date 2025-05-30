"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EquipmentForm from "../../components/EquipmentForm";
import { fetchApi } from "@/lib/api";
import { Equipment } from "../../types/equipmentTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditEquipmentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/equipment/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thiết bị");
                }

                const data = await response.json();
                setEquipment(data);
            } catch (error) {
                console.error("Error fetching equipment:", error);
                toast.error("Không thể tải thông tin thiết bị");
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [id, router]);

    const handleSubmit = async (formData: FormData) => {
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/equipment/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thiết bị"
                );
            }

            toast.success("Cập nhật thiết bị thành công");
            router.push("/dashboard/equipments");
        } catch (error) {
            console.error("Error updating equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thiết bị"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="equipments">
                <LoadingSpinner message="Đang tải thông tin thiết bị..." />
            </DashboardLayout>
        );
    }

    if (!equipment) {
        return (
            <DashboardLayout activeTab="equipments">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không thể tải thông tin thiết bị
                    </p>
                    <button
                        className="mt-4 text-blue-600 underline"
                        onClick={() => router.push("/dashboard/equipments")}
                    >
                        Quay lại danh sách thiết bị
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="equipments">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chỉnh sửa thiết bị</h1>
                </div>

                <EquipmentForm
                    equipment={equipment}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
}
