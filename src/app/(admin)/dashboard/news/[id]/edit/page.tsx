"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "@/app/(admin)/dashboard/components/layout/DashboardLayout";
import NewsForm from "../../components/NewsForm";
// import LoadingSpinner from "@/components/ui/loading-spinner";
import { News } from "../../types/newsTypes";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

export default function EditNewsPage() {
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const params = useParams();
    const router = useRouter();
    const newsId = params.id;

    // Lấy thông tin tin tức cần sửa
    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                // Gọi API lấy chi tiết tin tức
                const response = await fetchApi(`/news/${newsId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error("Không tìm thấy tin tức");
                        router.push("/dashboard/news");
                        return;
                    }
                    throw new Error("Không thể tải thông tin tin tức");
                }

                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Error fetching news details:", error);
                toast.error("Không thể tải thông tin tin tức");
                router.push("/dashboard/news");
            } finally {
                setLoading(false);
            }
        };

        if (newsId) {
            fetchNewsDetails();
        }
    }, [newsId, router]);

    // Xử lý cập nhật tin tức
    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Xử lý tệp ảnh (nếu có)
            const thumbnailFile = formData.get("thumbnail") as File;
            if (thumbnailFile && thumbnailFile.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append("file", thumbnailFile);

                const uploadResponse = await fetchApi("/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: imageFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("Không thể tải lên hình ảnh");
                }

                const uploadData = await uploadResponse.json();
                formData.set("thumbnail", uploadData.filePath);
            } else {
                // Nếu thumbnail là chuỗi rỗng thì xóa ảnh
                if (formData.get("thumbnail") === "") {
                    // Giữ nguyên để báo hiệu xóa ảnh
                } else {
                    // Không có thay đổi về ảnh
                    formData.delete("thumbnail");
                }
            }

            // Gửi API để cập nhật tin tức
            const response = await fetchApi(`/news/${newsId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật tin tức"
                );
            }

            toast.success("Cập nhật tin tức thành công");
            router.push("/dashboard/news");
        } catch (error) {
            console.error("Error updating news:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật tin tức"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Hiển thị loading khi đang tải dữ liệu
    if (loading) {
        return (
            <DashboardLayout activeTab="news">
                <LoadingSpinner message="Đang tải thông tin tin tức..." />
            </DashboardLayout>
        );
    }

    // Hiển thị thông báo không tìm thấy tin tức
    if (!news) {
        return (
            <DashboardLayout activeTab="news">
                <div className="flex flex-col items-center justify-center py-12">
                    <h2 className="text-2xl font-bold mb-4">
                        Không tìm thấy tin tức
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tin tức bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
                    </p>
                    <Button onClick={() => router.push("/dashboard/news")}>
                        Quay lại danh sách tin tức
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="news">
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/news")}
                        disabled={submitting}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Chỉnh sửa tin tức</h1>
                </div>

                <Separator className="my-4" />

                <NewsForm
                    news={news}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
}
