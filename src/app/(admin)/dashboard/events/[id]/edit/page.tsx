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

    const handleSubmit = async (formData: FormData) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Gửi request để cập nhật sự kiện
            const response = await fetchApi(`/events/${eventId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thông tin sự kiện"
                );
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
