// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackCard.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Eye,
    Edit,
    MessageSquare,
    Calendar,
    MapPin,
    Building,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Feedback } from "../types/feedback";
import RatingDisplay from "./RatingDisplay";
import StatusBadge from "./StatusBadge";

interface FeedbackCardProps {
    feedback: Feedback;
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onUpdateStatus: (id: number, status: Feedback["status"]) => void;
}

export default function FeedbackCard({
    feedback,
    onView,
    onEdit,
    onUpdateStatus,
}: FeedbackCardProps) {
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

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            {/* ✅ Sửa lỗi: Kiểm tra getImageUrl trước khi render */}
                            {getImageUrl(feedback.user?.avatar) && (
                                <AvatarImage
                                    src={getImageUrl(feedback.user?.avatar)}
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
                                {format(
                                    new Date(feedback.created_at),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: vi }
                                )}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={feedback.status} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                    <RatingDisplay rating={feedback.rating} size="md" />
                </div>

                {/* Comment */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 text-sm line-clamp-3">
                        {feedback.comment}
                    </p>
                </div>

                {/* Location Info */}
                <div className="space-y-2">
                    {feedback.venue && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{feedback.venue.name}</span>
                        </div>
                    )}

                    {feedback.court && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{feedback.court.name}</span>
                        </div>
                    )}

                    {feedback.booking && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {format(
                                    new Date(feedback.booking.booking_date),
                                    "dd/MM/yyyy",
                                    { locale: vi }
                                )}{" "}
                                • {feedback.booking.start_time} -{" "}
                                {feedback.booking.end_time}
                            </span>
                        </div>
                    )}
                </div>

                {/* Response */}
                {feedback.response && (
                    <div className="border-l-4 border-blue-500 pl-3 bg-blue-50 rounded-r-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                                Phản hồi từ{" "}
                                {feedback.responder?.fullname ||
                                    feedback.responder?.username ||
                                    "Admin"}
                            </span>
                            {feedback.response_date && (
                                <span className="text-xs text-blue-600">
                                    •{" "}
                                    {format(
                                        new Date(feedback.response_date),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: vi }
                                    )}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-blue-700">
                            {feedback.response}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(feedback.feedback_id)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(feedback.feedback_id)}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Phản hồi
                        </Button>
                    </div>

                    {feedback.status === "pending" && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onUpdateStatus(
                                        feedback.feedback_id,
                                        "approved"
                                    )
                                }
                                className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                                Duyệt
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    onUpdateStatus(
                                        feedback.feedback_id,
                                        "rejected"
                                    )
                                }
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                Từ chối
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
