"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "../../components/DashboardLayout";
import EquipmentForm from "../components/EquipmentForm";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddEquipmentPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/equipment", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể thêm thiết bị");
            }

            toast.success("Thêm thiết bị thành công");
            router.push("/dashboard/equipment");
        } catch (error) {
            console.error("Error adding equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể thêm thiết bị"
            );
        } finally {
            setSubmitting(false);
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
                            disabled={submitting}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Thêm thiết bị mới
                        </h1>
                    </div>
                </div>

                <Separator className="my-6" />

                <EquipmentForm onSubmit={handleSubmit} />
            </div>
        </DashboardLayout>
    );
}
