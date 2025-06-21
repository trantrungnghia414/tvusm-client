// client/src/app/(admin)/dashboard/feedbacks/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Edit,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Calendar,
    User,
    Building,
    MapPin,
    Clock,
    Star,
    Send,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RatingDisplay from "../components/RatingDisplay";
import StatusBadge from "../components/StatusBadge";
import { Feedback } from "../types/feedback";
import { fetchApi } from "@/lib/api";

export default function FeedbackDetailPage() {
    const router = useRouter();
    const params = useParams();
    const feedbackId = params.id as string;

    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedbackDetail = async () => {
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
                console.error("Error fetching feedback detail:", error);
                toast.error("Không thể tải thông tin phản hồi");
                router.push("/dashboard/feedbacks");
            } finally {
                setLoading(false);
            }
        };

        if (feedbackId) {
            fetchFeedbackDetail();
        }
    }, [feedbackId, router]);

    const handleUpdateStatus = async (status: Feedback["status"]) => {
        if (!feedback) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi(
                `/feedbacks/${feedback.feedback_id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật trạng thái"
                );
            }

            setFeedback({
                ...feedback,
                status,
                updated_at: new Date().toISOString(),
            });
            toast.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái"
            );
        }
    };

    // ✅ Sửa getImageUrl để trả về undefined thay vì null
    const getImageUrl = (path?: string) => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;
        return `http://localhost:3000${path}`;
    };

    const getInitials = (name?: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="feedbacks">
                <LoadingSpinner message="Đang tải thông tin phản hồi..." />
            </DashboardLayout>
        );
    }

    if (!feedback) {
        return (
            <DashboardLayout activeTab="feedbacks">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Không tìm thấy phản hồi
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Phản hồi này có thể đã bị xóa hoặc không tồn tại
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/feedbacks")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="feedbacks">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/feedbacks")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Phản hồi #
                                {feedback.feedback_id
                                    .toString()
                                    .padStart(6, "0")}
                            </h1>
                            <p className="text-gray-600">
                                Tạo lúc{" "}
                                {format(
                                    new Date(feedback.created_at),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi }
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.push(
                                    `/dashboard/feedbacks/${feedback.feedback_id}/edit`
                                )
                            }
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Phản hồi
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* User & Feedback */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Phản hồi từ khách hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        {/* ✅ Conditional rendering cho AvatarImage */}
                                        {getImageUrl(feedback.user?.avatar) && (
                                            <AvatarImage
                                                src={getImageUrl(
                                                    feedback.user?.avatar
                                                )}
                                                alt={
                                                    feedback.user?.fullname ||
                                                    feedback.user?.username ||
                                                    "User avatar"
                                                }
                                            />
                                        )}
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                            {getInitials(
                                                feedback.user?.fullname ||
                                                    feedback.user?.username
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {feedback.user?.fullname ||
                                                feedback.user?.username}
                                        </h3>
                                        <p className="text-gray-600">
                                            {feedback.user?.email}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                {format(
                                                    new Date(
                                                        feedback.created_at
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Đánh giá
                                    </h4>
                                    <RatingDisplay
                                        rating={feedback.rating}
                                        size="lg"
                                    />
                                </div>

                                {/* Comment */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Nội dung phản hồi
                                    </h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {feedback.comment}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Booking & Location Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Thông tin liên quan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {feedback.venue && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                                                Địa điểm
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">
                                                        {feedback.venue.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {
                                                            feedback.venue
                                                                .location
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {feedback.court && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                                                Sân
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {feedback.court.name}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {feedback.booking && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                                            Thông tin đặt sân
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="font-medium">
                                                    {format(
                                                        new Date(
                                                            feedback.booking.booking_date
                                                        ),
                                                        "dd/MM/yyyy",
                                                        { locale: vi }
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {
                                                        feedback.booking
                                                            .start_time
                                                    }{" "}
                                                    -{" "}
                                                    {feedback.booking.end_time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Response */}
                        {feedback.response && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="h-5 w-5" />
                                        Phản hồi từ quản trị viên
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-700">
                                                {feedback.responder?.fullname ||
                                                    feedback.responder
                                                        ?.username ||
                                                    "Admin"}
                                            </span>
                                            {feedback.response_date && (
                                                <>
                                                    <span className="text-blue-600">
                                                        •
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                        {format(
                                                            new Date(
                                                                feedback.response_date
                                                            ),
                                                            "dd/MM/yyyy HH:mm",
                                                            { locale: vi }
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-blue-700 whitespace-pre-wrap leading-relaxed">
                                            {feedback.response}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status & Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Trạng thái & hành động</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Trạng thái hiện tại
                                    </p>
                                    <StatusBadge
                                        status={feedback.status}
                                        size="lg"
                                    />
                                </div>

                                {feedback.status === "pending" && (
                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={() =>
                                                handleUpdateStatus("approved")
                                            }
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Duyệt phản hồi
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() =>
                                                handleUpdateStatus("rejected")
                                            }
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Từ chối
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rating Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5" />
                                    Thông tin đánh giá
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Điểm đánh giá
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-yellow-600">
                                            {feedback.rating}
                                        </span>
                                        <span className="text-gray-400">
                                            /5
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Mức độ hài lòng
                                    </p>
                                    <p className="font-medium">
                                        {feedback.rating >= 4.5
                                            ? "Rất hài lòng"
                                            : feedback.rating >= 3.5
                                            ? "Hài lòng"
                                            : feedback.rating >= 2.5
                                            ? "Bình thường"
                                            : feedback.rating >= 1.5
                                            ? "Không hài lòng"
                                            : "Rất không hài lòng"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch sử</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Ngày tạo:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(feedback.created_at),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </div>

                                    {feedback.response_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Ngày phản hồi:
                                            </span>
                                            <span className="text-blue-600 font-medium">
                                                {format(
                                                    new Date(
                                                        feedback.response_date
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Cập nhật cuối:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(feedback.updated_at),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
