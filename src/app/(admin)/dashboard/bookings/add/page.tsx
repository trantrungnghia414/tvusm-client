// client/src/app/(admin)/dashboard/bookings/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingForm from "../components/BookingForm";
import { CreateBookingDto } from "../types/booking";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function AddBookingPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (bookingData: CreateBookingDto) => {
        try {
            setSubmitting(true);

            // Validate required fields
            if (
                !bookingData.court_id ||
                !bookingData.date ||
                !bookingData.start_time ||
                !bookingData.end_time
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
            if (!bookingData.total_amount) {
                // This would typically be calculated based on court hourly rate and duration
                // For now, we'll let the backend calculate it
                delete bookingData.total_amount;
            }

            const response = await fetchApi("/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo đặt sân mới"
                );
            }

            toast.success("Tạo đặt sân mới thành công");
            router.push("/dashboard/bookings");
        } catch (error) {
            console.error("Error creating booking:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo đặt sân mới"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="bookings">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Thêm đặt sân mới
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Tạo đặt sân mới cho khách hàng
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <BookingForm
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
