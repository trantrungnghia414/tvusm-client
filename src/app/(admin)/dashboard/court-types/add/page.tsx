"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtTypeForm from "../components/CourtTypeForm";

export default function AddCourtTypePage() {
    const router = useRouter();

    const handleSubmit = async (formData: {
        name: string;
        description?: string;
        standard_size?: string;
    }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/court-types", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể thêm loại sân");
            }

            toast.success("Thêm loại sân thành công");
            router.push("/dashboard/court-types");
        } catch (error) {
            console.error("Error creating court type:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể thêm loại sân"
            );
        }
    };

    return (
        <DashboardLayout activeTab="court-types">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Thêm loại sân mới</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <CourtTypeForm onSubmit={handleSubmit} />
                </div>
            </div>
        </DashboardLayout>
    );
}
