// client/src/app/(admin)/dashboard/feedbacks/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import FeedbackForm from "../../components/FeedbackForm";
import { Feedback, UpdateFeedbackDto } from "../../types/feedback";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditFeedbackPage() {
    const router = useRouter();
    const params = useParams();
    const feedbackId = params.id as string;

    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi(`/feedbacks/${feedbackId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin phản hồi");
                }

                const data = await response.json();
                setFeedback(data);
            } catch (error) {
                console.error("Error fetching feedback:", error);
                toast.error("Không thể tải thông tin phản hồi");
                router.push("/dashboard/feedbacks");
            } finally {
                setLoading(false);
            }
        };

        if (feedbackId) {
            fetchFeedback();
        }
    }, [feedbackId, router]);

    const handleSave = async (data: UpdateFeedbackDto) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(`/feedbacks/${feedbackId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...data,
                    response_date: data.response
                        ? new Date().toISOString()
                        : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật phản hồi"
                );
            }

            toast.success("Cập nhật phản hồi thành công");
            router.push(`/dashboard/feedbacks/${feedbackId}`);
        } catch (error) {
            console.error("Error updating feedback:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật phản hồi"
            );
        }
    };

    const handleCancel = () => {
        router.push(`/dashboard/feedbacks/${feedbackId}`);
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="feedbacks">
                <LoadingSpinner message="Đang tải thông tin phản hồi..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="feedbacks">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Phản hồi khách hàng
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Phản hồi và cập nhật trạng thái cho đánh giá của khách
                        hàng
                    </p>
                </div>

                <FeedbackForm
                    feedback={feedback || undefined}
                    isEdit={true}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </DashboardLayout>
    );
}
