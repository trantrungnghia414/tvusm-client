"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import EquipmentForm from "../components/EquipmentForm";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function AddEquipmentPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);

            // Kiểm tra các trường bắt buộc
            const name = formData.get("name");
            const code = formData.get("code");
            const categoryId = formData.get("category_id");

            if (!name || !code || !categoryId) {
                toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để tạo thiết bị mới
            const response = await fetchApi("/equipment", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            // Xử lý lỗi chi tiết hơn
            if (!response.ok) {
                let errorMessage = "Không thể tạo thiết bị mới";
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    errorMessage = errorData.message || errorMessage;
                }

                throw new Error(errorMessage);
            }

            toast.success("Tạo thiết bị mới thành công");
            router.push("/dashboard/equipments");
        } catch (error) {
            console.error("Error creating equipment:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo thiết bị mới"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="equipments">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm thiết bị mới</h1>
                </div>

                <EquipmentForm
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
}
