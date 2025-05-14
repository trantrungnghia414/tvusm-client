import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Court } from "../types/courtTypes";

// Interface cho API response
interface CourtApiResponse {
    court_id: number;
    venue_id: number;
    type_id: number;
    name: string;
    code: string;
    hourly_rate: number;
    status: "available" | "booked" | "maintenance";
    image: string | null;
    description: string | null;
    is_indoor: boolean;
    created_at: string;
    updated_at: string;
    venue_name: string;
    type_name: string;
}

interface CourtActionsProps {
    onAddCourt: () => void;
    courts?: Court[];
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

export default function CourtActions({
    onAddCourt,
    courts = [],
}: CourtActionsProps) {
    const handleExport = async () => {
        try {
            // Nếu không có dữ liệu courts được truyền vào, lấy từ API
            let dataToExport = courts;

            if (courts.length === 0) {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    return;
                }

                // Fetch dữ liệu từ API
                const response = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách sân");
                }

                const data = await response.json();
                // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
                dataToExport = data.map((court: CourtApiResponse) => ({
                    court_id: court.court_id,
                    venue_id: court.venue_id,
                    type_id: court.type_id,
                    name: court.name,
                    code: court.code,
                    hourly_rate: court.hourly_rate,
                    status: court.status,
                    venue_name: court.venue_name,
                    type_name: court.type_name,
                    description: court.description || "",
                    is_indoor: court.is_indoor,
                    image: court.image,
                    created_at: court.created_at,
                    updated_at: court.updated_at,
                }));
            }

            // Phương pháp đơn giản hơn để tạo bảng Excel với tiêu đề
            const title = "DANH SÁCH SÂN THỂ THAO";
            const subtitle = "NHÀ THI ĐẤU TRƯỜNG ĐẠI HỌC TRÀ VINH";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

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
                    "Tên sân",
                    "Mã sân",
                    "Nhà thi đấu",
                    "Loại sân",
                    "Vị trí",
                    "Giá thuê/giờ",
                    "Trạng thái",
                    "Ngày tạo",
                ],
            ];

            // Thêm dữ liệu sân
            dataToExport.forEach((court, index) => {
                wsData.push([
                    (index + 1).toString(),
                    court.name,
                    court.code,
                    court.venue_name || "",
                    court.type_name || "",
                    court.is_indoor ? "Trong nhà" : "Ngoài trời",
                    court.hourly_rate.toString(),
                    translateStatus(court.status),
                    formatDate(court.created_at),
                ]);
            });

            // Thêm hàng tổng số sân
            wsData.push(["", "", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số sân: ${dataToExport.length}`,
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

            // Áp dụng style (nếu cần)
            // Định nghĩa các styles
            const titleStyle: CellStyle = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: "center" },
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

            // Style cho hàng có nền màu (mỗi 5 sân)
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
            ws[subtitleCell].s = titleStyle;

            // Áp dụng style cho header
            for (let i = 0; i < 9; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho tất cả các ô dữ liệu và thêm màu nền xen kẽ
            dataToExport.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 sân
                // Math.floor(rowIndex / 5) % 2 sẽ cho giá trị 0 hoặc 1 mỗi 5 dòng
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 9; colIndex++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: colIndex,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Áp dụng style cho dòng tổng
            const totalRowIndex = dataToExport.length + 8;
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
            for (let i = 0; i < 9; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 25 }, // Tên sân
                { wch: 12 }, // Mã sân
                { wch: 25 }, // Nhà thi đấu
                { wch: 20 }, // Loại sân
                { wch: 15 }, // Vị trí
                { wch: 15 }, // Giá thuê
                { wch: 20 }, // Trạng thái
                { wch: 20 }, // Ngày tạo
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 8 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách sân thể thao");

            // Xuất file Excel
            XLSX.writeFile(
                wb,
                `danh_sach_san_the_thao_${formatDateFilename(new Date())}.xlsx`
            );

            toast.success("Xuất Excel thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
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
            case "available":
                return "Sẵn sàng sử dụng";
            case "booked":
                return "Đã đặt";
            case "maintenance":
                return "Đang bảo trì";
            default:
                return status;
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
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Hàm định dạng ngày tháng cho tên file
    const formatDateFilename = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    return (
        <div className="flex gap-2">
            <Button onClick={onAddCourt}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm sân mới
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
