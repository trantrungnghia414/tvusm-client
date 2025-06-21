// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackTable.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Eye,
    Edit,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    MessageSquare,
    Building,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Feedback } from "../types/feedback";
import RatingDisplay from "./RatingDisplay";
import StatusBadge from "./StatusBadge";

interface FeedbackTableProps {
    feedbacks: Feedback[];
    onView: (id: number) => void;
    onEdit: (id: number) => void;
    onUpdateStatus: (id: number, status: Feedback["status"]) => void;
    selectedFeedbacks: number[];
    onSelectionChange: (ids: number[]) => void;
    loading?: boolean;
}

export default function FeedbackTable({
    feedbacks,
    onView,
    onEdit,
    onUpdateStatus,
    selectedFeedbacks,
    onSelectionChange,
    loading = false,
}: FeedbackTableProps) {
    const [sortField, setSortField] = useState<keyof Feedback>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

    // Handle sort
    const handleSort = (field: keyof Feedback) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    // Sort feedbacks
    const sortedFeedbacks = React.useMemo(() => {
        return [...feedbacks].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [feedbacks, sortField, sortOrder]);

    // Handle select all
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(feedbacks.map((f) => f.feedback_id));
        } else {
            onSelectionChange([]);
        }
    };

    // Handle single selection
    const handleSelectFeedback = (feedbackId: number, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedFeedbacks, feedbackId]);
        } else {
            onSelectionChange(
                selectedFeedbacks.filter((id) => id !== feedbackId)
            );
        }
    };

    const isAllSelected =
        feedbacks.length > 0 && selectedFeedbacks.length === feedbacks.length;
    const isPartiallySelected =
        selectedFeedbacks.length > 0 &&
        selectedFeedbacks.length < feedbacks.length;

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (feedbacks.length === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Không có phản hồi nào
                        </h3>
                        <p className="text-gray-600">
                            Chưa có phản hồi nào từ khách hàng.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Danh sách phản hồi ({feedbacks.length})</span>
                    {selectedFeedbacks.length > 0 && (
                        <span className="text-sm font-normal text-blue-600">
                            Đã chọn {selectedFeedbacks.length} phản hồi
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    {/* ✅ Sửa lỗi: Loại bỏ indeterminate prop, sử dụng data-indeterminate */}
                                    <Checkbox
                                        checked={isAllSelected}
                                        data-indeterminate={isPartiallySelected}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("user_id")}
                                >
                                    Người dùng
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("rating")}
                                >
                                    Đánh giá
                                </TableHead>
                                <TableHead>Nội dung</TableHead>
                                <TableHead>Địa điểm</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("status")}
                                >
                                    Trạng thái
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort("created_at")}
                                >
                                    Ngày tạo
                                </TableHead>
                                <TableHead>Phản hồi</TableHead>
                                <TableHead className="w-20">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedFeedbacks.map((feedback) => (
                                <TableRow
                                    key={feedback.feedback_id}
                                    className="hover:bg-gray-50"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedFeedbacks.includes(
                                                feedback.feedback_id
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleSelectFeedback(
                                                    feedback.feedback_id,
                                                    checked as boolean
                                                )
                                            }
                                        />
                                    </TableCell>

                                    {/* User */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                {/* ✅ Sửa lỗi: Kiểm tra getImageUrl trả về undefined */}
                                                {getImageUrl(
                                                    feedback.user?.avatar
                                                ) && (
                                                    <AvatarImage
                                                        src={getImageUrl(
                                                            feedback.user
                                                                ?.avatar
                                                        )}
                                                        alt={
                                                            feedback.user
                                                                ?.fullname ||
                                                            feedback.user
                                                                ?.username ||
                                                            "User avatar"
                                                        }
                                                    />
                                                )}
                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                    {getInitials(
                                                        feedback.user
                                                            ?.fullname ||
                                                            feedback.user
                                                                ?.username
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {feedback.user?.fullname ||
                                                        feedback.user?.username}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {feedback.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Rating */}
                                    <TableCell>
                                        <RatingDisplay
                                            rating={feedback.rating}
                                            size="sm"
                                        />
                                    </TableCell>

                                    {/* Comment */}
                                    <TableCell className="max-w-xs">
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {feedback.comment}
                                        </p>
                                    </TableCell>

                                    {/* Venue */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            {feedback.venue && (
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Building className="h-3 w-3" />
                                                    <span>
                                                        {feedback.venue.name}
                                                    </span>
                                                </div>
                                            )}
                                            {feedback.court && (
                                                <div className="text-xs text-gray-500">
                                                    {feedback.court.name}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <StatusBadge
                                            status={feedback.status}
                                            size="sm"
                                        />
                                    </TableCell>

                                    {/* Created Date */}
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                {format(
                                                    new Date(
                                                        feedback.created_at
                                                    ),
                                                    "dd/MM/yy",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Response */}
                                    <TableCell>
                                        {feedback.response ? (
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>Đã phản hồi</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Chưa phản hồi
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onView(
                                                            feedback.feedback_id
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onEdit(
                                                            feedback.feedback_id
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Phản hồi
                                                </DropdownMenuItem>

                                                {feedback.status ===
                                                    "pending" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onUpdateStatus(
                                                                    feedback.feedback_id,
                                                                    "approved"
                                                                )
                                                            }
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Duyệt
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onUpdateStatus(
                                                                    feedback.feedback_id,
                                                                    "rejected"
                                                                )
                                                            }
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Từ chối
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
