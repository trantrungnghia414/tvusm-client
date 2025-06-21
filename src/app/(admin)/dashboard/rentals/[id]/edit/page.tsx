// client/src/app/(admin)/dashboard/rentals/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import RentalForm from "../../components/RentalForm";
import { CreateRentalDto, Rental } from "../../types/rental";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditRentalPage() {
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rental, setRental] = useState<Rental | null>(null);
    const router = useRouter();
    const params = useParams();
    const rentalId = params.id as string;

    useEffect(() => {
        const fetchRental = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/rentals/${rentalId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin thuê thiết bị");
                }

                const data = await response.json();

                // Transform data to match interface
                const transformedRental: Rental = {
                    rental_id: data.rental_id,
                    user_id: data.user_id,
                    equipment_id: data.equipment_id,
                    quantity: data.quantity,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    total_amount: data.total_amount,
                    status: data.status,
                    payment_status: data.payment_status || "pending",
                    notes: data.notes || "",
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    user: data.user
                        ? {
                              user_id: data.user.user_id,
                              username: data.user.username,
                              email: data.user.email,
                              fullname: data.user.fullname || data.user.name,
                              phone: data.user.phone,
                          }
                        : undefined,
                    equipment: data.equipment
                        ? {
                              equipment_id: data.equipment.equipment_id,
                              name: data.equipment.name,
                              code: data.equipment.code,
                              category_name:
                                  data.equipment.category_name ||
                                  data.equipment.category?.name ||
                                  "",
                              rental_fee: data.equipment.rental_fee,
                              available_quantity:
                                  data.equipment.available_quantity,
                              status: data.equipment.status,
                              image: data.equipment.image,
                          }
                        : undefined,
                };

                setRental(transformedRental);
            } catch (error) {
                console.error("Error fetching rental:", error);
                toast.error("Không thể tải thông tin thuê thiết bị");
                router.push("/dashboard/rentals");
            } finally {
                setLoading(false);
            }
        };

        if (rentalId) {
            fetchRental();
        }
    }, [rentalId, router]);

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

            const response = await fetchApi(`/rentals/${rentalId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(rentalData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Không thể cập nhật thông tin thuê thiết bị"
                );
            }

            toast.success("Cập nhật thông tin thuê thiết bị thành công");
            router.push(`/dashboard/rentals/${rentalId}`);
        } catch (error) {
            console.error("Error updating rental:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin thuê thiết bị"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="rentals">
                <LoadingSpinner message="Đang tải thông tin thuê thiết bị..." />
            </DashboardLayout>
        );
    }

    if (!rental) {
        return (
            <DashboardLayout activeTab="rentals">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không tìm thấy thông tin thuê thiết bị
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/rentals")}
                        className="mt-4 text-blue-500 underline"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    // Transform rental data for form
    const initialData: Partial<CreateRentalDto> = {
        user_id: rental.user_id,
        equipment_id: rental.equipment_id,
        quantity: rental.quantity,
        start_date: rental.start_date,
        end_date: rental.end_date,
        total_amount: rental.total_amount,
        notes: rental.notes,
    };

    return (
        <DashboardLayout activeTab="rentals">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Chỉnh sửa thuê thiết bị #RE
                        {rental.rental_id.toString().padStart(4, "0")}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Cập nhật thông tin thuê thiết bị
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <RentalForm
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        initialData={initialData}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
