"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

// import DashboardLayout from "../../../../components/layout/DashboardLayout";
import EventForm from "../../components/EventForm";
// import LoadingSpinner from "@/components/ui/loading-spinner";

import { Event } from "../../types/eventTypes";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditEventPage() {
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error("Không tìm thấy thông tin sự kiện");
                        router.push("/dashboard/events");
                        return;
                    }
                    throw new Error("Không thể tải thông tin sự kiện");
                }

                const eventData = await response.json();
                setEvent(eventData);
            } catch (error) {
                console.error("Error fetching event:", error);
                toast.error("Không thể tải thông tin sự kiện");
                router.push("/dashboard/events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, router]);

    // Cập nhật hàm handleSubmit
    const handleSubmit = async (formData: FormData) => {
        try {
            // Kiểm tra dữ liệu bắt buộc một lần nữa
            const title = formData.get("title")?.toString().trim();
            const eventType = formData.get("event_type")?.toString();
            const venueId = formData.get("venue_id")?.toString();
            const startDate = formData.get("start_date")?.toString();

            // Kiểm tra đầy đủ các trường bắt buộc
            if (!title || !eventType || !venueId || !startDate) {
                if (!title) toast.error("Vui lòng nhập tên sự kiện");
                if (!eventType) toast.error("Vui lòng chọn loại sự kiện");
                if (!venueId) toast.error("Vui lòng chọn địa điểm");
                if (!startDate) toast.error("Vui lòng chọn ngày bắt đầu");

                return; // Ngăn API được gọi
            }

            // Tiếp tục xử lý nếu dữ liệu đầy đủ
            setSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Xử lý court_id trước khi gửi
            const courtId = formData.get("court_id");
            if (courtId === "none" || courtId === "") {
                formData.delete("court_id");
            }

            // Thêm logging để debug
            console.log("Submitting data:", {
                title: formData.get("title"),
                event_type: formData.get("event_type"),
                venue_id: formData.get("venue_id"),
                start_date: formData.get("start_date"),
                court_id: formData.get("court_id"),
                status: formData.get("status"),
            });

            // Gửi request để cập nhật sự kiện
            const response = await fetchApi(`/events/${eventId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // Xử lý lỗi chi tiết
                const contentType = response.headers.get("content-type");
                let errorMessage = "Không thể cập nhật thông tin sự kiện";

                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    errorMessage = errorData.message || errorMessage;
                }

                throw new Error(errorMessage);
            }

            toast.success("Cập nhật thông tin sự kiện thành công");
            router.push("/dashboard/events");
        } catch (error) {
            console.error("Error updating event:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin sự kiện"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="events">
                <LoadingSpinner message="Đang tải thông tin sự kiện..." />
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout activeTab="events">
                <div className="text-center py-10">
                    <p className="text-red-500">
                        Không tìm thấy thông tin sự kiện
                    </p>
                    <Button
                        onClick={() => router.push("/dashboard/events")}
                        className="mt-4 text-blue-500 underline"
                    >
                        Quay lại danh sách sự kiện
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

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
                    <h1 className="text-2xl font-bold">Chỉnh sửa sự kiện</h1>
                </div>

                <Separator className="my-4" />

                <EventForm
                    event={event}
                    onSubmit={handleSubmit}
                    isSubmitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
}
