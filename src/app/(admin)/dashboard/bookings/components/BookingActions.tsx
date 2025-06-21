// client/src/app/(admin)/dashboard/bookings/components/BookingActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Download,
    FileText,
    RefreshCw,
    MoreHorizontal,
    Calendar,
    Filter,
    Settings,
} from "lucide-react";
import { Booking } from "../types/booking";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingActionsProps {
    onAddBooking: () => void;
    bookings: Booking[];
    onRefresh: () => void;
    loading?: boolean;
}

export default function BookingActions({
    onAddBooking,
    bookings,
    onRefresh,
    loading = false,
}: BookingActionsProps) {
    const [exporting, setExporting] = useState(false);

    const exportToExcel = async () => {
        try {
            setExporting(true);

            // Prepare data for export
            const dataToExport = bookings.map((booking, index) => ({
                STT: index + 1,
                "Mã đặt sân": `BK${booking.booking_id
                    .toString()
                    .padStart(4, "0")}`,
                "Khách hàng":
                    booking.user?.fullname || booking.user?.username || "N/A",
                Email: booking.user?.email || "N/A",
                "Số điện thoại": booking.user?.phone || "N/A",
                Sân: booking.court?.name || "N/A",
                "Loại sân": booking.court?.type_name || "N/A",
                "Ngày đặt": format(new Date(booking.date), "dd/MM/yyyy", {
                    locale: vi,
                }),
                "Giờ bắt đầu": booking.start_time,
                "Giờ kết thúc": booking.end_time,
                "Tổng tiền": booking.total_amount,
                "Trạng thái": getStatusText(booking.status),
                "Thanh toán": getPaymentStatusText(booking.payment_status),
                "Ghi chú": booking.notes || "",
                "Ngày tạo": format(
                    new Date(booking.created_at),
                    "dd/MM/yyyy HH:mm",
                    { locale: vi }
                ),
            }));

            // Create workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(dataToExport);

            // Set column widths
            const colWidths = [
                { wch: 5 }, // STT
                { wch: 12 }, // Mã đặt sân
                { wch: 20 }, // Khách hàng
                { wch: 25 }, // Email
                { wch: 15 }, // Số điện thoại
                { wch: 20 }, // Sân
                { wch: 15 }, // Loại sân
                { wch: 12 }, // Ngày đặt
                { wch: 10 }, // Giờ bắt đầu
                { wch: 10 }, // Giờ kết thúc
                { wch: 15 }, // Tổng tiền
                { wch: 15 }, // Trạng thái
                { wch: 15 }, // Thanh toán
                { wch: 30 }, // Ghi chú
                { wch: 18 }, // Ngày tạo
            ];
            ws["!cols"] = colWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách đặt sân");

            // Generate filename
            const currentDate = format(new Date(), "dd-MM-yyyy", {
                locale: vi,
            });
            const filename = `danh-sach-dat-san-${currentDate}.xlsx`;

            // Save file
            XLSX.writeFile(wb, filename);
        } catch (error) {
            console.error("Error exporting bookings:", error);
        } finally {
            setExporting(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xác nhận";
            case "confirmed":
                return "Đã xác nhận";
            case "completed":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chưa thanh toán";
            case "paid":
                return "Đã thanh toán";
            case "refunded":
                return "Đã hoàn tiền";
            default:
                return status;
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={onAddBooking}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm đặt sân
                </Button>

                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Làm mới
                </Button>
            </div>

            <div className="flex gap-2">
                {/* Export Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Xuất file
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={exportToExcel}
                            disabled={exporting || bookings.length === 0}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            {exporting ? "Đang xuất..." : "Xuất Excel"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <FileText className="h-4 w-4 mr-2" />
                            Xuất PDF (Sắp có)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* More Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Xem lịch đặt sân
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Filter className="h-4 w-4 mr-2" />
                            Lưu bộ lọc
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Cài đặt hiển thị
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
