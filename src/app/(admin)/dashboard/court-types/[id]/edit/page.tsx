"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtTypeForm from "../../components/CourtTypeForm";
import { CourtType } from "../../types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditCourtTypePage() {
    const params = useParams();
    const typeId = params.id;
    const router = useRouter();
    const [courtType, setCourtType] = useState<CourtType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourtType = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/court-types/${typeId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin loại sân");
                }

                const courtTypeData = await response.json();
                setCourtType(courtTypeData);
            } catch (error) {
                console.error("Error fetching court type:", error);
                toast.error("Không thể tải thông tin loại sân");
                router.push("/dashboard/court-types");
            } finally {
                setLoading(false);
            }
        };

        fetchCourtType();
    }, [typeId, router]);

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/court-types/${typeId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thông tin loại sân"
                );
            }

            toast.success("Cập nhật thông tin loại sân thành công");
            router.push("/dashboard/court-types");
        } catch (error) {
            console.error("Error updating court type:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin loại sân"
            );
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="court-types">
                <LoadingSpinner message="Đang tải thông tin loại sân..." />
            </DashboardLayout>
        );
    }

    if (!courtType) {
        return (
            <DashboardLayout activeTab="court-types">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không tìm thấy thông tin loại sân
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/court-types")}
                        className="mt-4 text-blue-500 underline"
                    >
                        Quay lại danh sách loại sân
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="court-types">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chỉnh sửa loại sân</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <CourtTypeForm
                        courtType={courtType}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
