import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Database, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { Equipment } from "../types/equipmentTypes";
import { useRouter } from "next/navigation";

interface EquipmentActionsProps {
    onAddEquipment: () => void;
    equipments: Equipment[];
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

export default function EquipmentActions({
    onAddEquipment,
    equipments = [],
}: EquipmentActionsProps) {
    // Hàm xuất Excel
    const handleExport = async () => {
        try {
            if (equipments.length === 0) {
                toast.error("Không có dữ liệu để xuất");
                return;
            }

            const fileName = `Danh_sach_thiet_bi_${formatDateFilename(
                new Date()
            )}.xlsx`;

            // Tiêu đề cho file Excel
            const title = "DANH SÁCH TRANG THIẾT BỊ";
            const subtitle = "HỆ THỐNG QUẢN LÝ CƠ SỞ VẬT CHẤT THỂ THAO TVU";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Tên thiết bị",
                    "Mã thiết bị",
                    "Danh mục",
                    "Trạng thái",
                    "Số seri",
                    "Nhà sản xuất",
                    "Model",
                    "Giá mua",
                    "Địa điểm",
                    "Sân",
                    "Ngày tạo",
                ],
            ];

            // Thêm dữ liệu vào worksheet
            equipments.forEach((item, index) => {
                wsData.push([
                    (index + 1).toString(),
                    item.name,
                    item.code,
                    item.category_name || "",
                    translateStatus(item.status),
                    item.serial_number || "",
                    item.manufacturer || "",
                    item.model || "",
                    item.purchase_price
                        ? `${item.purchase_price.toLocaleString()}đ`
                        : "",
                    item.venue_name || "",
                    item.court_name || "",
                    formatDate(item.created_at),
                ]);
            });

            // Thêm hàng tổng số thiết bị
            wsData.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số thiết bị: ${equipments.length}`,
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

            // Style cho hàng có nền màu (mỗi 5 thiết bị)
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
            for (let i = 0; i < 12; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho dữ liệu và thêm màu nền xen kẽ
            equipments.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 thiết bị
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 12; colIndex++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: colIndex,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Áp dụng style cho dòng tổng
            const totalRowIndex = equipments.length + 8;
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
            for (let i = 0; i < 12; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 25 }, // Tên thiết bị
                { wch: 15 }, // Mã thiết bị
                { wch: 15 }, // Danh mục
                { wch: 15 }, // Trạng thái
                { wch: 15 }, // Số seri
                { wch: 20 }, // Nhà sản xuất
                { wch: 15 }, // Model
                { wch: 15 }, // Giá mua
                { wch: 20 }, // Địa điểm
                { wch: 15 }, // Sân
                { wch: 20 }, // Ngày tạo
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } }, // Date
                {
                    s: { r: equipments.length + 8, c: 0 },
                    e: { r: equipments.length + 8, c: 11 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách thiết bị");

            // Xuất file Excel
            XLSX.writeFile(wb, fileName);
            toast.success("Xuất Excel thành công!");
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
            case "available":
                return "Có sẵn";
            case "in_use":
                return "Đang sử dụng";
            case "maintenance":
                return "Đang bảo trì";
            case "unavailable":
                return "Không khả dụng";
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

    // Sử dụng useRouter để chuyển hướng
    const router = useRouter();

    // Hàm xử lý chuyển hướng đến trang quản lý danh mục
    const handleGoToCategories = () => {
        router.push("/dashboard/equipment-categories");
    };

    return (
        <div className="flex items-center gap-2">
            {/* Nút thêm thiết bị */}
            <Button onClick={onAddEquipment}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thiết bị
            </Button>

            {/* Nút báo cáo sự cố */}
            <Button
                variant="outline"
                onClick={() => router.push("/dashboard/equipments/report")}
            >
                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                Báo cáo sự cố
            </Button>

            {/* Thêm nút chuyển sang trang quản lý danh mục */}
            <Button variant="outline" onClick={handleGoToCategories}>
                <Database className="mr-2 h-4 w-4" />
                Quản lý danh mục
            </Button>
            {/* Nút xuất Excel */}
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
