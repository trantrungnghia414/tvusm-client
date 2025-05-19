"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "../../../components/DashboardLayout";
import EquipmentForm from "../../components/EquipmentForm";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Equipment } from "../../types/equipmentTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditEquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const params = useParams();
    const equipmentId = params.id;

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/equipment/${equipmentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thiết bị");
                }

                const data = await response.json();
                setEquipment(data);
            } catch (error) {
                console.error("Error fetching equipment:", error);
                toast.error("Không thể tải thông tin thiết bị");
                router.push("/dashboard/equipment");
            } finally {
                setLoading(false);
            }
        };

        fetchEquipment();
    }, [equipmentId, router]);

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/equipment/${equipmentId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thông tin thiết bị"
                );
            }

            toast.success("Cập nhật thông tin thiết bị thành công");
            router.push("/dashboard/equipment");
        } catch (error) {
            console.error("Error updating equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin thiết bị"
            );
        }
    };

    return (
        <DashboardLayout activeTab="equipment">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/dashboard/equipment")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Chỉnh sửa thông tin thiết bị
                        </h1>
                    </div>
                </div>

                <Separator className="my-6" />

                {loading ? (
                    <LoadingSpinner message="Đang tải thông tin thiết bị..." />
                ) : (
                    equipment && (
                        <EquipmentForm
                            equipment={equipment}
                            onSubmit={handleSubmit}
                        />
                    )
                )}
            </div>
        </DashboardLayout>
    );
}
