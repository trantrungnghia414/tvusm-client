// client/src/app/(admin)/dashboard/bookings/components/BookingActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar } from "lucide-react";
import { Booking } from "../types/booking";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // ✅ Thêm useRouter

interface BookingActionsProps {
    onAddBooking: () => void;
    bookings: Booking[];
    onRefresh: () => void;
    loading?: boolean;
}

export default function BookingActions({
    bookings,
}: BookingActionsProps) {
    const [exporting, setExporting] = useState(false);
    const router = useRouter(); // ✅ Khởi tạo router

    const exportToExcel = async () => {
        try {
            setExporting(true);

            if (bookings.length === 0) {
                toast.error("Không có dữ liệu để xuất");
                return;
            }

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
                "Tổng tiền": booking.total_amount.toLocaleString("vi-VN") + "đ",
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

            toast.success(`Đã xuất ${bookings.length} đặt sân ra file Excel`);
        } catch (error) {
            console.error("Error exporting bookings:", error);
            toast.error("Không thể xuất file Excel");
        } finally {
            setExporting(false);
        }
    };

    // ✅ Handler cho nút xem lịch sân
    const handleViewSchedule = () => {
        router.push("/dashboard/schedule");
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

                {/* ✅ Nút xem lịch sân */}
                <Button
                    onClick={handleViewSchedule}
                    variant="outline"
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Xem lịch sân
                </Button>
            </div>

            <div className="flex gap-2">
                {/* Export Excel Button */}
                <Button
                    variant="outline"
                    onClick={exportToExcel}
                    disabled={exporting || bookings.length === 0}
                >
                    <FileDown className="h-4 w-4 mr-2" />
                    {exporting ? "Đang xuất..." : "Xuất Excel"}
                </Button>
            </div>
        </div>
    );
}
