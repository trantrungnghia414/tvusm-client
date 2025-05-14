"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import CourtForm from "../../components/CourtForm";
import { Court } from "../../types/courtTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditCourtPage() {
    const params = useParams();
    const courtId = params.id;
    const router = useRouter();
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourt = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/courts/${courtId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin sân");
                }

                const courtData = await response.json();
                setCourt(courtData);
            } catch (error) {
                console.error("Error fetching court:", error);
                toast.error("Không thể tải thông tin sân");
                router.push("/dashboard/courts");
            } finally {
                setLoading(false);
            }
        };

        fetchCourt();
    }, [courtId, router]);

    const handleSubmit = async (formData: FormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/courts/${courtId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thông tin sân"
                );
            }

            toast.success("Cập nhật thông tin sân thành công");
            router.push("/dashboard/courts");
        } catch (error) {
            console.error("Error updating court:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin sân"
            );
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="courts">
                <LoadingSpinner message="Đang tải thông tin sân..." />
            </DashboardLayout>
        );
    }

    if (!court) {
        return (
            <DashboardLayout activeTab="courts">
                <div className="text-center py-10">
                    <p className="text-red-500">Không tìm thấy thông tin sân</p>
                    <button
                        onClick={() => router.push("/dashboard/courts")}
                        className="mt-4 text-blue-500 underline"
                    >
                        Quay lại danh sách sân
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="courts">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Chỉnh sửa thông tin sân</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <CourtForm court={court} onSubmit={handleSubmit} />
                </div>
            </div>
        </DashboardLayout>
    );
}
