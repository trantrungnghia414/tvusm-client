"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import EventForm from "@/app/(admin)/dashboard/events/components/EventForm";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";

// import DashboardLayout from "../../../components/layout/DashboardLayout";
// import EventForm from "../components/EventForm";

export default function AddEventPage() {
    const [submitting, setSubmitting] = useState(false);
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
            const startDate = formData.get("startDate");
            const venueId = formData.get("venueId");
            const eventType = formData.get("eventType");

            if (!title || !startDate || !venueId || !eventType) {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            // Kiểm tra ngày bắt đầu và kết thúc
            const endDate = formData.get("endDate");
            if (
                endDate &&
                new Date(endDate as string) < new Date(startDate as string)
            ) {
                toast.error("Ngày kết thúc phải sau ngày bắt đầu");
                return;
            }

            // Kiểm tra thời gian bắt đầu và kết thúc
            const startTime = formData.get("startTime");
            const endTime = formData.get("endTime");

            if (startTime && endTime) {
                const startDateTime = new Date(`2000-01-01T${startTime}`);
                const endDateTime = new Date(`2000-01-01T${endTime}`);

                if (endDateTime <= startDateTime) {
                    toast.error(
                        "Thời gian kết thúc phải sau thời gian bắt đầu"
                    );
                    return;
                }
            }

            // Xử lý file ảnh (nếu có)
            const imageFile = formData.get("image") as File;
            if (imageFile && imageFile.size > 0) {
                const imageFormData = new FormData();
                imageFormData.append("file", imageFile);

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
                formData.set("image", uploadData.filePath);
            } else {
                formData.delete("image");
            }

            // Gọi API để tạo sự kiện mới
            const response = await fetchApi("/events", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể tạo sự kiện mới"
                );
            }

            toast.success("Thêm sự kiện thành công");
            router.push("/dashboard/events");
        } catch (error) {
            console.error("Error creating event:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo sự kiện mới"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout activeTab="events">
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push("/dashboard/events")}
                        disabled={submitting}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Thêm sự kiện mới</h1>
                </div>

                <Separator className="my-4" />

                <EventForm onSubmit={handleSubmit} isSubmitting={submitting} />
            </div>
        </DashboardLayout>
    );
}
