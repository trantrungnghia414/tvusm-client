"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "../../../../components/layout/DashboardLayout";
import NewsForm from "../../components/NewsForm";
// import LoadingSpinner from "@/components/ui/loading-spinner";
import { News } from "../../types/newsTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditNewsPage({ params }: { params: { id: string } }) {
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/news/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin tin tức");
                }

                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Error fetching news:", error);
                toast.error("Không thể tải thông tin tin tức");
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetails();
    }, [params.id, router]);

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gọi API để cập nhật tin tức
            const response = await fetchApi(`/news/${params.id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            // Xử lý lỗi chi tiết hơn
            if (!response.ok) {
                let errorMessage = "Không thể cập nhật thông tin tin tức";
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    errorMessage = errorData.message || errorMessage;
                }

                throw new Error(errorMessage);
            }

            toast.success("Cập nhật thông tin tin tức thành công");
            router.push("/dashboard/news");
        } catch (error) {
            console.error("Error updating news:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin tin tức"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="news">
                <LoadingSpinner message="Đang tải thông tin tin tức..." />
            </DashboardLayout>
        );
    }

    if (!news) {
        return (
            <DashboardLayout activeTab="news">
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-red-600">
                        Không tìm thấy tin tức
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Tin tức này không tồn tại hoặc đã bị xóa
                    </p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => router.push("/dashboard/news")}
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Chỉnh sửa tin tức</h1>
                </div>

                <NewsForm
                    news={news}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
}
