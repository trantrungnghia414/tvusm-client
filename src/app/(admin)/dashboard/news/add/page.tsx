"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import NewsForm from "@/app/(admin)/dashboard/news/components/NewsForm";

// import DashboardLayout from "@/app/(admin)/dashboard/components/layout/DashboardLayout";
// import NewsForm from "../components/NewsForm";

export default function AddNewsPage() {
    const [submitting, setSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Kiểm tra các trường bắt buộc
            const title = formData.get("title");
            const content = formData.get("content");
            const categoryId = formData.get("categoryId");
            const status = formData.get("status");

            if (!title || !content || !categoryId || !status) {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
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
                formData.delete("thumbnail");
            }

            // Gửi API để tạo tin tức mới
            const response = await fetchApi("/news", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo tin tức mới"
                );
            }

            toast.success("Thêm tin tức thành công");
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
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/news")}
                        disabled={submitting}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Thêm tin tức mới</h1>
                </div>

                <Separator className="my-4" />

                <NewsForm onSubmit={handleSubmit} isSubmitting={submitting} />
            </div>
        </DashboardLayout>
    );
}
