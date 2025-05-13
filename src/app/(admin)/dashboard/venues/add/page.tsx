"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import VenueForm from "@/app/(admin)/dashboard/venues/components/VenueForm";
// import VenueForm from "../components/VenueForm";

export default function AddVenuePage() {
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/venues", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể thêm nhà thi đấu"
                );
            }

            toast.success("Thêm nhà thi đấu thành công");
            router.push("/dashboard/venues");
        } catch (error) {
            console.error("Error creating venue:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể thêm nhà thi đấu"
            );
        }
    };

    return (
        <DashboardLayout activeTab="venues">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Thêm nhà thi đấu mới</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <VenueForm onSubmit={handleSubmit} />
                </div>
            </div>
        </DashboardLayout>
    );
}
