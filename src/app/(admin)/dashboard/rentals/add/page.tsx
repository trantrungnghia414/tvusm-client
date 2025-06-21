// client/src/app/(admin)/dashboard/rentals/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RentalForm from "../components/RentalForm";
import { CreateRentalDto } from "../types/rental";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function AddRentalPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (rentalData: CreateRentalDto) => {
        try {
            setSubmitting(true);

            // Validate required fields
            if (
                !rentalData.equipment_id ||
                !rentalData.start_date ||
                !rentalData.end_date ||
                !rentalData.quantity
            ) {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Calculate total amount if not provided
            if (!rentalData.total_amount) {
                // This would typically be calculated based on equipment rental fee and duration
                // For now, we'll let the backend calculate it
                delete rentalData.total_amount;
            }

            const response = await fetchApi("/rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(rentalData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo đơn thuê thiết bị mới"
                );
            }

            toast.success("Tạo đơn thuê thiết bị mới thành công");
            router.push("/dashboard/rentals");
        } catch (error) {
            console.error("Error creating rental:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo đơn thuê thiết bị mới"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="rentals">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thêm đơn thuê thiết bị mới
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tạo đơn thuê thiết bị mới cho khách hàng
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <RentalForm
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
