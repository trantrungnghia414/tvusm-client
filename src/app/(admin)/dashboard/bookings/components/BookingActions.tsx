// client/src/app/(admin)/dashboard/bookings/components/BookingActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Calendar } from "lucide-react";
import { Booking } from "../types/booking";
import * as XLSX from "xlsx-js-style";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BookingActionsProps {
    onAddBooking: () => void;
    bookings: Booking[];
    onRefresh: () => void;
    loading?: boolean;
}

// Định nghĩa kiểu cho cell style
interface CellStyle {
    font?: {
        bold?: boolean;
        sz?: number;
        color?: { rgb: string };
        italic?: boolean;
    };
    alignment?: {
        horizontal?: "center" | "left" | "right";
        vertical?: "center" | "top" | "bottom";
    };
    fill?: {
        fgColor?: { rgb: string };
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
    };
}

export default function BookingActions({ bookings }: BookingActionsProps) {
    const [exporting, setExporting] = useState(false);
    const router = useRouter(); // ✅ Khởi tạo router

    const exportToExcel = async () => {
        try {
            setExporting(true);

            if (bookings.length === 0) {
                toast.error("Không có dữ liệu để xuất");
                return;
            }

            const fileName = `Danh_sach_dat_san_${format(
                new Date(),
                "dd-MM-yyyy",
                { locale: vi }
            )}.xlsx`;

            // Tiêu đề cho file Excel
            const title = "DANH SÁCH ĐẶT SÂN THỂ THAO";
            const subtitle = "HỆ THỐNG QUẢN LÝ CƠ SỞ VẬT CHẤT THỂ THAO TVU";
            const dateTitle = `Ngày xuất: ${format(
                new Date(),
                "dd/MM/yyyy HH:mm",
                { locale: vi }
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Mã đặt sân",
                    "Khách hàng",
                    "Email",
                    "Số điện thoại",
                    "Sân",
                    "Loại sân",
                    "Ngày đặt",
                    "Giờ bắt đầu",
                    "Giờ kết thúc",
                    "Tổng tiền",
                    "Trạng thái",
                    "Thanh toán",
                    "Ngày tạo",
                ],
            ];

            // Thêm dữ liệu vào worksheet
            bookings.forEach((booking, index) => {
                wsData.push([
                    (index + 1).toString(),
                    `BK${booking.booking_id.toString().padStart(4, "0")}`,
                    booking.user?.fullname || booking.user?.username || "N/A",
                    booking.user?.email || "N/A",
                    booking.user?.phone || "N/A",
                    booking.court?.name || "N/A",
                    booking.court?.type_name || "N/A",
                    format(new Date(booking.date), "dd/MM/yyyy", {
                        locale: vi,
                    }),
                    booking.start_time,
                    booking.end_time,
                    booking.total_amount.toLocaleString("vi-VN") + "đ",
                    getStatusText(booking.status),
                    getPaymentStatusText(booking.payment_status),
                    format(new Date(booking.created_at), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                    }),
                ]);
            });

            // Thêm hàng tổng số đặt sân
            wsData.push([
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ]);
            wsData.push([
                `Tổng số đặt sân: ${bookings.length}`,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
            ]);

            // Tạo worksheet từ mảng dữ liệu
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Định nghĩa các styles
            const titleStyle: CellStyle = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: "center" },
            };

            const subtitleStyle: CellStyle = {
                font: { bold: true, sz: 14 },
                alignment: { horizontal: "center" },
            };

            const dateStyle: CellStyle = {
                font: { bold: true, sz: 12 },
                alignment: { horizontal: "left" },
            };

            const headerStyle: CellStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };

            const dataBorderStyle: CellStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { vertical: "center" },
            };

            // Style cho hàng có nền màu (mỗi 5 đặt sân)
            const coloredRowStyle: CellStyle = {
                ...dataBorderStyle,
                fill: { fgColor: { rgb: "E6F0FF" } }, // Màu xanh nhạt
            };

            // Áp dụng style cho tiêu đề
            const titleCell = XLSX.utils.encode_cell({ r: 2, c: 0 });
            if (!ws[titleCell]) ws[titleCell] = {};
            ws[titleCell].s = titleStyle;

            // Áp dụng style cho subtitle
            const subtitleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
            if (!ws[subtitleCell]) ws[subtitleCell] = {};
            ws[subtitleCell].s = subtitleStyle;

            // Áp dụng style cho ngày
            const dateCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
            if (!ws[dateCell]) ws[dateCell] = {};
            ws[dateCell].s = dateStyle;

            // Áp dụng style cho header
            for (let i = 0; i < 14; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho dữ liệu và thêm màu nền xen kẽ
            bookings.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 đặt sân
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 14; colIndex++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: colIndex,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Áp dụng style cho dòng tổng
            const totalRowIndex = bookings.length + 8;
            const totalStyle: CellStyle = {
                font: { bold: true, sz: 12 },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { horizontal: "left" },
                fill: { fgColor: { rgb: "DDEBF7" } }, // Màu nền xanh nhạt
            };

            // Áp dụng style cho dòng tổng
            for (let i = 0; i < 14; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
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
                { wch: 18 }, // Ngày tạo
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 13 } }, // Date
                {
                    s: { r: bookings.length + 8, c: 0 },
                    e: { r: bookings.length + 8, c: 13 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách đặt sân");

            // Xuất file Excel
            XLSX.writeFile(wb, fileName);

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
