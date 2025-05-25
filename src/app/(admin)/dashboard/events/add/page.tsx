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

            // Hardcode organizer_id cho trường hợp tạm thời
            // Đây là giải pháp tạm thời, nên sử dụng ID từ token khi có thể
            formData.set("organizer_id", "1");

            // Đảm bảo tất cả trường số được gửi đúng định dạng
            const venueId = formData.get("venue_id");
            if (venueId) {
                formData.set("venue_id", venueId.toString());
            }

            const courtId = formData.get("court_id");
            if (courtId && courtId !== "none") {
                formData.set("court_id", courtId.toString());
            } else {
                formData.delete("court_id"); // Đảm bảo không gửi giá trị "none"
            }

            // Đảm bảo các trường Boolean được gửi đúng
            const isPublic = formData.get("is_public");
            formData.set("is_public", isPublic === "on" ? "true" : "false");

            const isFeatured = formData.get("is_featured");
            formData.set("is_featured", isFeatured === "on" ? "true" : "false");

            // Log dữ liệu để debug
            console.log("Submitting data:", {
                title: formData.get("title"),
                start_date: formData.get("start_date"),
                venue_id: formData.get("venue_id"),
                event_type: formData.get("event_type"),
                organizer_id: formData.get("organizer_id"), // Kiểm tra giá trị này
            });

            // Gọi API để tạo sự kiện mới
            const response = await fetchApi("/events", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            // Xử lý lỗi chi tiết hơn
            if (!response.ok) {
                let errorMessage = "Không thể tạo sự kiện mới";
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);

                    if (typeof errorData.message === "string") {
                        errorMessage = errorData.message;
                    } else if (Array.isArray(errorData.message)) {
                        errorMessage = errorData.message.join(", ");
                    }
                } else {
                    const errorText = await response.text();
                    console.error("API Error Text:", errorText);
                }

                throw new Error(errorMessage);
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
