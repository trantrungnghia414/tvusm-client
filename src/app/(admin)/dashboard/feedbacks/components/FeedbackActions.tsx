// client/src/app/(admin)/dashboard/feedbacks/components/FeedbackActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    RefreshCw,
    Download,
    FileSpreadsheet,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    Filter,
    Grid,
    List,
} from "lucide-react";
import { toast } from "sonner";
import { Feedback } from "../types/feedback";
import * as XLSX from "xlsx";

interface FeedbackActionsProps {
    feedbacks: Feedback[];
    onRefresh: () => void;
    onBulkStatusUpdate: (
        feedbackIds: number[],
        status: Feedback["status"]
    ) => void;
    selectedFeedbacks: number[];
    loading?: boolean;
    viewMode: "grid" | "table";
    onViewModeChange: (mode: "grid" | "table") => void;
}

export default function FeedbackActions({
    feedbacks,
    onRefresh,
    onBulkStatusUpdate,
    selectedFeedbacks,
    loading = false,
    viewMode,
    onViewModeChange,
}: FeedbackActionsProps) {
    const router = useRouter();
    const [exporting, setExporting] = useState(false);

    // Export to Excel
    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const exportData = feedbacks.map((feedback, index) => ({
                STT: index + 1,
                ID: feedback.feedback_id,
                "Người dùng":
                    feedback.user?.fullname || feedback.user?.username || "",
                Email: feedback.user?.email || "",
                "Địa điểm": feedback.venue?.name || "",
                Sân: feedback.court?.name || "",
                "Đánh giá": feedback.rating,
                "Nội dung": feedback.comment,
                "Trạng thái":
                    feedback.status === "pending"
                        ? "Chờ duyệt"
                        : feedback.status === "approved"
                        ? "Đã duyệt"
                        : "Đã từ chối",
                "Phản hồi": feedback.response || "",
                "Ngày tạo": new Date(feedback.created_at).toLocaleDateString(
                    "vi-VN"
                ),
                "Ngày phản hồi": feedback.response_date
                    ? new Date(feedback.response_date).toLocaleDateString(
                          "vi-VN"
                      )
                    : "",
                "Người phản hồi":
                    feedback.responder?.fullname ||
                    feedback.responder?.username ||
                    "",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");

            // Auto-resize columns
            const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
                wch: Math.max(key.length, 15),
            }));
            ws["!cols"] = colWidths;

            XLSX.writeFile(
                wb,
                `feedbacks_${new Date().toISOString().split("T")[0]}.xlsx`
            );
            toast.success("Xuất Excel thành công");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Không thể xuất file Excel");
        } finally {
            setExporting(false);
        }
    };

    // Export filtered data
    const handleExportFiltered = async () => {
        if (selectedFeedbacks.length === 0) {
            toast.error("Vui lòng chọn ít nhất một phản hồi để xuất");
            return;
        }

        setExporting(true);
        try {
            const filteredData = feedbacks
                .filter((f) => selectedFeedbacks.includes(f.feedback_id))
                .map((feedback, index) => ({
                    STT: index + 1,
                    ID: feedback.feedback_id,
                    "Người dùng":
                        feedback.user?.fullname ||
                        feedback.user?.username ||
                        "",
                    Email: feedback.user?.email || "",
                    "Địa điểm": feedback.venue?.name || "",
                    Sân: feedback.court?.name || "",
                    "Đánh giá": feedback.rating,
                    "Nội dung": feedback.comment,
                    "Trạng thái":
                        feedback.status === "pending"
                            ? "Chờ duyệt"
                            : feedback.status === "approved"
                            ? "Đã duyệt"
                            : "Đã từ chối",
                    "Phản hồi": feedback.response || "",
                    "Ngày tạo": new Date(
                        feedback.created_at
                    ).toLocaleDateString("vi-VN"),
                    "Ngày phản hồi": feedback.response_date
                        ? new Date(feedback.response_date).toLocaleDateString(
                              "vi-VN"
                          )
                        : "",
                }));

            const ws = XLSX.utils.json_to_sheet(filteredData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Selected_Feedbacks");

            // Auto-resize columns
            const colWidths = Object.keys(filteredData[0] || {}).map((key) => ({
                wch: Math.max(key.length, 15),
            }));
            ws["!cols"] = colWidths;

            XLSX.writeFile(
                wb,
                `selected_feedbacks_${
                    new Date().toISOString().split("T")[0]
                }.xlsx`
            );
            toast.success("Xuất dữ liệu đã chọn thành công");
        } catch (error) {
            console.error("Error exporting filtered data:", error);
            toast.error("Không thể xuất dữ liệu đã chọn");
        } finally {
            setExporting(false);
        }
    };

    // Bulk approve selected feedbacks
    const handleBulkApprove = () => {
        if (selectedFeedbacks.length === 0) {
            toast.error("Vui lòng chọn ít nhất một phản hồi");
            return;
        }
        onBulkStatusUpdate(selectedFeedbacks, "approved");
    };

    // Bulk reject selected feedbacks
    const handleBulkReject = () => {
        if (selectedFeedbacks.length === 0) {
            toast.error("Vui lòng chọn ít nhất một phản hồi");
            return;
        }
        onBulkStatusUpdate(selectedFeedbacks, "rejected");
    };

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <span>Thao tác</span>
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center border rounded-lg p-1">
                            <Button
                                variant={
                                    viewMode === "grid" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => onViewModeChange("grid")}
                                className="h-8 px-3"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={
                                    viewMode === "table" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => onViewModeChange("table")}
                                className="h-8 px-3"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                    {/* ✅ Add New Feedback Button */}
                    <Button
                        onClick={() => router.push("/dashboard/feedbacks/add")}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm phản hồi
                    </Button>

                    {/* Refresh */}
                    <Button
                        variant="outline"
                        onClick={onRefresh}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                        Làm mới
                    </Button>

                    {/* Bulk Actions */}
                    {selectedFeedbacks.length > 0 && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleBulkApprove}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt ({selectedFeedbacks.length})
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleBulkReject}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối ({selectedFeedbacks.length})
                            </Button>
                        </>
                    )}

                    {/* Export Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled={exporting}>
                                <Download className="h-4 w-4 mr-2" />
                                Xuất dữ liệu
                                <MoreHorizontal className="h-4 w-4 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleExportExcel}>
                                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                                Xuất tất cả Excel
                            </DropdownMenuItem>
                            {selectedFeedbacks.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleExportFiltered}
                                    >
                                        <Filter className="h-4 w-4 mr-2 text-blue-600" />
                                        Xuất dữ liệu đã chọn (
                                        {selectedFeedbacks.length})
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Stats Summary */}
                    <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                        <span>
                            Tổng: <strong>{feedbacks.length}</strong> phản hồi
                        </span>
                        <span>
                            Đánh giá TB:{" "}
                            <strong>
                                {feedbacks.length > 0
                                    ? (
                                          feedbacks.reduce(
                                              (sum, f) => sum + f.rating,
                                              0
                                          ) / feedbacks.length
                                      ).toFixed(1)
                                    : "0"}
                                /5
                            </strong>
                        </span>
                        {selectedFeedbacks.length > 0 && (
                            <span className="text-blue-600 font-medium">
                                Đã chọn:{" "}
                                <strong>{selectedFeedbacks.length}</strong>
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
