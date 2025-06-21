// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Save,
    ArrowLeft,
    Loader2,
    User,
    MessageSquare,
    Star,
    Send,
    Building,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Feedback, UpdateFeedbackDto } from "../types/feedback";
import RatingDisplay from "./RatingDisplay";
import StatusBadge from "./StatusBadge";

interface FeedbackFormProps {
    feedback?: Feedback;
    isEdit?: boolean;
    onSave: (data: UpdateFeedbackDto) => Promise<void>;
    onCancel: () => void;
}

export default function FeedbackForm({
    feedback,
    onSave,
    onCancel,
}: FeedbackFormProps) {
    const [formData, setFormData] = useState<UpdateFeedbackDto>({
        status: feedback?.status || "pending",
        response: feedback?.response || "",
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ✅ Sửa lỗi: Trả về undefined thay vì null
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

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.status === "approved" && !formData.response?.trim()) {
            newErrors.response = "Vui lòng nhập phản hồi khi duyệt";
        }

        if (formData.response && formData.response.length > 1000) {
            newErrors.response = "Phản hồi không được vượt quá 1000 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Error saving feedback:", error);
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes
    const handleInputChange = (
        field: keyof UpdateFeedbackDto,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    if (!feedback) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy phản hồi
                </h2>
                <p className="text-gray-600 mb-4">
                    Phản hồi này có thể đã bị xóa hoặc không tồn tại
                </p>
                <Button variant="outline" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Original Feedback */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Phản hồi gốc
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    {/* ✅ Sửa lỗi: Kiểm tra getImageUrl trước khi render */}
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
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        {getInitials(
                                            feedback.user?.fullname ||
                                                feedback.user?.username
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {feedback.user?.fullname ||
                                            feedback.user?.username}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {feedback.user?.email}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {format(
                                            new Date(feedback.created_at),
                                            "dd/MM/yyyy HH:mm",
                                            { locale: vi }
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <Label className="text-sm font-medium">
                                    Đánh giá
                                </Label>
                                <RatingDisplay
                                    rating={feedback.rating}
                                    size="lg"
                                />
                            </div>

                            {/* Comment */}
                            <div>
                                <Label className="text-sm font-medium">
                                    Nội dung phản hồi
                                </Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {feedback.comment}
                                    </p>
                                </div>
                            </div>

                            {/* Location & Booking Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {feedback.venue && (
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Địa điểm
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Building className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {feedback.venue.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {feedback.court && (
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Sân
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-700">
                                                {feedback.court.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {feedback.booking && (
                                    <div className="md:col-span-2">
                                        <Label className="text-sm font-medium">
                                            Thông tin đặt sân
                                        </Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {format(
                                                    new Date(
                                                        feedback.booking.booking_date
                                                    ),
                                                    "dd/MM/yyyy",
                                                    { locale: vi }
                                                )}{" "}
                                                • {feedback.booking.start_time}{" "}
                                                - {feedback.booking.end_time}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Response */}
                    {feedback.response && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    Phản hồi hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-blue-700">
                                            {feedback.responder?.fullname ||
                                                feedback.responder?.username ||
                                                "Admin"}
                                        </span>
                                        {feedback.response_date && (
                                            <span className="text-xs text-blue-600">
                                                •{" "}
                                                {format(
                                                    new Date(
                                                        feedback.response_date
                                                    ),
                                                    "dd/MM/yyyy HH:mm",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                        {feedback.response}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Response Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                {feedback.response
                                    ? "Cập nhật phản hồi"
                                    : "Phản hồi"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Response Text */}
                            <div>
                                <Label htmlFor="response">
                                    Nội dung phản hồi
                                    {formData.status === "approved" && (
                                        <span className="text-red-500 ml-1">
                                            *
                                        </span>
                                    )}
                                </Label>
                                <Textarea
                                    id="response"
                                    value={formData.response}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "response",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nhập phản hồi cho khách hàng..."
                                    rows={6}
                                    className={
                                        errors.response ? "border-red-500" : ""
                                    }
                                />
                                {errors.response && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.response}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.response?.length || 0}/1000 ký tự
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Trạng thái & hành động
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Current Status */}
                            <div>
                                <Label className="text-sm font-medium mb-2 block">
                                    Trạng thái hiện tại
                                </Label>
                                <StatusBadge
                                    status={feedback.status}
                                    size="lg"
                                />
                            </div>

                            {/* Status Selection */}
                            <div>
                                <Label htmlFor="status">
                                    Cập nhật trạng thái
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(
                                        value: Feedback["status"]
                                    ) => handleInputChange("status", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    status="pending"
                                                    size="sm"
                                                />
                                                Chờ duyệt
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    status="approved"
                                                    size="sm"
                                                />
                                                Duyệt
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            <div className="flex items-center gap-2">
                                                <StatusBadge
                                                    status="rejected"
                                                    size="sm"
                                                />
                                                Từ chối
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Submit Actions */}
                            <div className="space-y-3 pt-4">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Lưu thay đổi
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={onCancel}
                                    disabled={saving}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Hủy bỏ
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feedback Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin phản hồi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label className="text-sm font-medium">
                                    ID
                                </Label>
                                <p className="text-sm text-gray-700">
                                    #
                                    {feedback.feedback_id
                                        .toString()
                                        .padStart(6, "0")}
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">
                                    Đánh giá
                                </Label>
                                <RatingDisplay
                                    rating={feedback.rating}
                                    size="sm"
                                />
                            </div>

                            <div>
                                <Label className="text-sm font-medium">
                                    Ngày tạo
                                </Label>
                                <p className="text-sm text-gray-700">
                                    {format(
                                        new Date(feedback.created_at),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: vi }
                                    )}
                                </p>
                            </div>

                            {feedback.response_date && (
                                <div>
                                    <Label className="text-sm font-medium">
                                        Ngày phản hồi
                                    </Label>
                                    <p className="text-sm text-gray-700">
                                        {format(
                                            new Date(feedback.response_date),
                                            "dd/MM/yyyy HH:mm",
                                            { locale: vi }
                                        )}
                                    </p>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium">
                                    Cập nhật cuối
                                </Label>
                                <p className="text-sm text-gray-700">
                                    {format(
                                        new Date(feedback.updated_at),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: vi }
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Response Templates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                Mẫu phản hồi nhanh
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start"
                                onClick={() =>
                                    handleInputChange(
                                        "response",
                                        "Cảm ơn bạn đã gửi phản hồi. Chúng tôi rất trân trọng ý kiến của bạn và sẽ cải thiện dịch vụ."
                                    )
                                }
                            >
                                Cảm ơn phản hồi
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start"
                                onClick={() =>
                                    handleInputChange(
                                        "response",
                                        "Chúng tôi xin lỗi vì trải nghiệm không tốt. Chúng tôi đã ghi nhận và sẽ khắc phục vấn đề này."
                                    )
                                }
                            >
                                Xin lỗi và khắc phục
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-left justify-start"
                                onClick={() =>
                                    handleInputChange(
                                        "response",
                                        "Cảm ơn bạn đã đánh giá cao dịch vụ của chúng tôi. Chúng tôi sẽ tiếp tục cải thiện để phục vụ bạn tốt hơn."
                                    )
                                }
                            >
                                Đánh giá tích cực
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
