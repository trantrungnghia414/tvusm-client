import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { CourtType } from "../types";

interface CourtTypeActionsProps {
    onAddCourtType: () => void;
    courtTypes?: CourtType[];
}

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

export default function CourtTypeActions({
    onAddCourtType,
    courtTypes = [],
}: CourtTypeActionsProps) {
    const handleExport = async () => {
        try {
            // Nếu không có dữ liệu courtTypes được truyền vào, lấy từ API
            let dataToExport = courtTypes;

            if (courtTypes.length === 0) {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    return;
                }

                // Fetch dữ liệu từ API
                const response = await fetchApi("/court-types", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách loại sân");
                }

                dataToExport = await response.json();
            }

            // Tạo file Excel từ dữ liệu
            const title = "DANH SÁCH LOẠI SÂN";
            const subtitle = "NHÀ THI ĐẤU TRƯỜNG ĐẠI HỌC TRÀ VINH";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", ""],
                ["", "", "", "", ""],
                [title, "", "", "", ""],
                ["", "", "", "", ""],
                [dateTitle, "", "", "", ""],
                ["", "", "", "", ""],
                [
                    "STT",
                    "Tên loại sân",
                    "Kích thước tiêu chuẩn",
                    "Mô tả",
                    "Ngày tạo",
                ],
            ];

            // Thêm dữ liệu loại sân
            dataToExport.forEach((type, index) => {
                wsData.push([
                    (index + 1).toString(),
                    type.name,
                    type.standard_size || "Chưa có thông tin",
                    type.description || "Chưa có thông tin",
                    formatDate(type.created_at),
                ]);
            });

            // Thêm hàng tổng số loại sân
            wsData.push(["", "", "", "", ""]);
            wsData.push([
                `Tổng số loại sân: ${dataToExport.length}`,
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

            // Style cho hàng có nền màu
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
            for (let i = 0; i < 5; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho tất cả các ô dữ liệu
            dataToExport.forEach((_, rowIndex) => {
                const currentRow = rowIndex + 7;
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                for (let colIndex = 0; colIndex < 5; colIndex++) {
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

            for (let i = 0; i < 5; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 25 }, // Tên loại sân
                { wch: 20 }, // Kích thước tiêu chuẩn
                { wch: 30 }, // Mô tả
                { wch: 20 }, // Ngày tạo
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 4 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách loại sân");

            // Xuất file Excel
            XLSX.writeFile(
                wb,
                `danh_sach_loai_san_${formatDateFilename(new Date())}.xlsx`
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
            <Button onClick={onAddCourtType}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm loại sân mới
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
