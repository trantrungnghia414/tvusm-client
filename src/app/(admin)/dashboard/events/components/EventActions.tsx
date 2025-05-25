import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Event } from "../types/eventTypes";

interface EventActionsProps {
    onAddEvent: () => void;
    events: Event[];
}

// Định nghĩa kiểu cho cell style
interface CellStyle {
    font?: {
        bold?: boolean;
        sz?: number;
        color?: { rgb: string };
        name?: string;
    };
    alignment?: {
        horizontal?: string;
        vertical?: string;
        wrapText?: boolean;
    };
    fill?: {
        fgColor: { rgb: string };
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
    };
}

export default function EventActions({
    onAddEvent,
    events = [],
}: EventActionsProps) {
    const handleExport = async () => {
        try {
            // Mảng dữ liệu để xuất Excel
            const dataToExport = events;

            // Nếu không có dữ liệu, hiển thị thông báo
            if (dataToExport.length === 0) {
                toast.info("Không có dữ liệu để xuất");
                return;
            }

            // Tên file xuất
            const fileName = `danh_sach_su_kien_${formatDateFilename(
                new Date()
            )}.xlsx`;

            // Tạo workbook mới
            const wb = XLSX.utils.book_new();

            // Tạo title và subtitle
            const title = "DANH SÁCH SỰ KIỆN";
            const subtitle = "TVU Sports Hub - Trường Đại học Trà Vinh";
            const dateTitle =
                "Ngày xuất: " +
                format(new Date(), "dd/MM/yyyy HH:mm", { locale: vi });

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Tên sự kiện",
                    "Loại sự kiện",
                    "Địa điểm",
                    "Ngày bắt đầu",
                    "Ngày kết thúc",
                    "Người tổ chức", // Thêm cột "Người tổ chức"
                    "Người tham gia",
                    "Trạng thái",
                ],
            ];

            // Thêm dữ liệu sự kiện
            dataToExport.forEach((event, index) => {
                wsData.push([
                    (index + 1).toString(),
                    event.title,
                    translateEventType(event.event_type),
                    event.venue_name || "",
                    formatDate(event.start_date),
                    event.end_date
                        ? formatDate(event.end_date)
                        : "Chưa có thông tin",
                    event.organizer_name ||
                        event.organizer?.fullname ||
                        event.organizer?.username ||
                        "", // Thêm người/đơn vị tổ chức
                    `${event.current_participants}${
                        event.max_participants
                            ? `/${event.max_participants}`
                            : ""
                    }`,
                    translateStatus(event.status),
                ]);
            });

            // Thêm hàng tổng số sự kiện
            wsData.push(["", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số sự kiện: ${dataToExport.length}`,
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

            // Áp dụng style (nếu cần)
            // Định nghĩa các styles
            const titleStyle: CellStyle = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: "center" },
            };

            const subtitleStyle: CellStyle = {
                font: { bold: true, sz: 14 },
                alignment: { horizontal: "center" },
            };

            const dateTitleStyle: CellStyle = {
                font: { bold: true, sz: 12 },
                alignment: { horizontal: "center" },
            };

            const headerStyle: CellStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                alignment: { horizontal: "center", vertical: "center" },
                fill: { fgColor: { rgb: "4472C4" } },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };

            const totalRowIndex = 7 + dataToExport.length + 1;

            // Áp dụng style cho subtitle
            ws["A1"].s = subtitleStyle;

            // Áp dụng style cho title
            ws["A3"].s = titleStyle;

            // Áp dụng style cho date title
            ws["A5"].s = dateTitleStyle;

            // Áp dụng style cho header
            for (let i = 0; i < 8; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                ws[cell].s = headerStyle;
            }

            // Style cho dòng có nền màu
            const dataBorderStyle: CellStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { vertical: "center" },
            };

            // Style cho hàng có nền màu (mỗi 5 sự kiện)
            const coloredRowStyle: CellStyle = {
                ...dataBorderStyle,
                fill: { fgColor: { rgb: "E6F0FF" } }, // Màu xanh nhạt
            };

            // Áp dụng style cho tất cả các ô dữ liệu và thêm màu nền xen kẽ
            dataToExport.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 sự kiện
                // Math.floor(rowIndex / 5) % 2 sẽ cho giá trị 0 hoặc 1 mỗi 5 dòng
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let i = 0; i < 8; i++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: i,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Style cho dòng tổng
            const totalStyle: CellStyle = {
                font: { bold: true },
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
            for (let i = 0; i < 8; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 30 }, // Tên sự kiện
                { wch: 15 }, // Loại sự kiện
                { wch: 25 }, // Địa điểm
                { wch: 15 }, // Ngày bắt đầu
                { wch: 15 }, // Ngày kết thúc
                { wch: 15 }, // Người tham gia
                { wch: 15 }, // Trạng thái
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // Date
            ];

            // Thêm worksheet vào workbook
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách sự kiện");

            // Xuất file Excel
            XLSX.writeFile(wb, fileName);
            toast.success("Xuất file Excel thành công");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error(
                "Không thể xuất file Excel: " +
                    (error instanceof Error
                        ? error.message
                        : "Lỗi không xác định")
            );
        }
    };

    // Hàm chuyển đổi trạng thái từ tiếng Anh sang tiếng Việt
    const translateStatus = (status: string): string => {
        switch (status) {
            case "upcoming":
                return "Sắp diễn ra";
            case "ongoing":
                return "Đang diễn ra";
            case "completed":
                return "Đã hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Hàm chuyển đổi loại sự kiện từ tiếng Anh sang tiếng Việt
    const translateEventType = (type: string): string => {
        switch (type) {
            case "competition":
                return "Thi đấu";
            case "training":
                return "Tập luyện";
            case "friendly":
                return "Giao lưu";
            case "school_event":
                return "Sự kiện trường";
            case "other":
                return "Khác";
            default:
                return type;
        }
    };

    // Hàm định dạng ngày tháng
    const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Hàm định dạng ngày tháng cho tên file
    const formatDateFilename = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    return (
        <div className="flex gap-2">
            <Button onClick={onAddEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sự kiện
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
