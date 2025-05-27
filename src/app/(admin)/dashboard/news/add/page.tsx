"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "../../../components/layout/DashboardLayout";
import NewsForm from "../components/NewsForm";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
// import LoadingSpinner from "@/components/ui/loading-spinner";

export default function AddNewsPage() {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);

            // Kiểm tra các trường bắt buộc
            const title = formData.get("title");
            const content = formData.get("content");
            const categoryId = formData.get("category_id");

            if (!title || !content || !categoryId) {
                toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để tạo tin tức mới
            const response = await fetchApi("/news", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            // Xử lý lỗi chi tiết hơn
            if (!response.ok) {
                let errorMessage = "Không thể tạo tin tức mới";
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    errorMessage = errorData.message || errorMessage;
                }

                throw new Error(errorMessage);
            }

            toast.success("Tạo tin tức mới thành công");
            router.push("/dashboard/news");
        } catch (error) {
            console.error("Error creating news:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo tin tức mới"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Thêm tin tức mới</h1>
                </div>

                <NewsForm onSubmit={handleSubmit} isSubmitting={submitting} />
            </div>
        </DashboardLayout>
    );
}
