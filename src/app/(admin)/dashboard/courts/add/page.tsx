"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtForm from "../components/CourtForm";

export default function AddCourtPage() {
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/courts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể thêm sân");
            }

            toast.success("Thêm sân thành công");
            router.push("/dashboard/courts");
        } catch (error) {
            console.error("Error creating court:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể thêm sân"
            );
        }
    };

    return (
        <DashboardLayout activeTab="courts">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Thêm sân mới</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <CourtForm onSubmit={handleSubmit} />
                </div>
            </div>
        </DashboardLayout>
    );
}
