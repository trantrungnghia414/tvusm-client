import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Database } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { Equipment } from "../types/equipmentTypes";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
    };
    alignment?: {
        horizontal?: string;
        vertical?: string;
    };
    fill?: {
        fgColor?: {
            rgb: string;
        };
    };
    border?: {
        top?: {
            style: string;
            color: { rgb: string };
        };
        bottom?: {
            style: string;
            color: { rgb: string };
        };
        left?: {
            style: string;
            color: { rgb: string };
        };
        right?: {
            style: string;
            color: { rgb: string };
        };
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

            // Dữ liệu sẽ xuất ra Excel
            const dataToExport = equipments.map((item) => ({
                equipment_id: item.equipment_id,
                name: item.name,
                code: item.code,
                category_id: item.category_id,
                category_name: item.category_name || "",
                quantity: item.quantity,
                available_quantity: item.available_quantity,
                status: item.status,
                description: item.description || "",
                purchase_date: item.purchase_date || "",
                purchase_price: item.purchase_price || 0,
                rental_fee: item.rental_fee,
                venue_id: item.venue_id || "",
                venue_name: item.venue_name || "",
                created_at: item.created_at,
                updated_at: item.updated_at,
            }));

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
                    "ID",
                    "Tên thiết bị",
                    "Mã thiết bị",
                    "Danh mục",
                    "Trạng thái",
                    "Số lượng",
                    "Có sẵn",
                    "Giá mua",
                    "Phí thuê",
                    "Ngày mua",
                    "Địa điểm",
                ],
            ];

            // Thêm dữ liệu vào worksheet
            dataToExport.forEach((item, index) => {
                wsData.push([
                    (index + 1).toString(), // Chuyển STT thành chuỗi
                    item.equipment_id.toString(), // Chuyển ID thành chuỗi
                    item.name,
                    item.code,
                    item.category_name,
                    translateStatus(item.status),
                    item.quantity.toString(), // Chuyển số lượng thành chuỗi
                    item.available_quantity.toString(), // Chuyển số lượng có sẵn thành chuỗi
                    item.purchase_price ? item.purchase_price.toString() : "", // Chuyển giá mua thành chuỗi hoặc chuỗi rỗng nếu null
                    item.rental_fee.toString(), // Chuyển phí thuê thành chuỗi
                    formatDate(item.purchase_date),
                    item.venue_name,
                ]);
            });

            // Thêm hàng tổng số thiết bị
            wsData.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số thiết bị: ${dataToExport.length}`,
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
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                fill: { fgColor: { rgb: "D9EAD3" } },
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
            dataToExport.forEach((_, rowIndex) => {
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
            for (let i = 0; i < 12; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 5 }, // ID
                { wch: 30 }, // Tên thiết bị
                { wch: 15 }, // Mã thiết bị
                { wch: 15 }, // Danh mục
                { wch: 15 }, // Trạng thái
                { wch: 10 }, // Số lượng
                { wch: 10 }, // Có sẵn
                { wch: 15 }, // Giá mua
                { wch: 15 }, // Phí thuê
                { wch: 15 }, // Ngày mua
                { wch: 25 }, // Địa điểm
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 11 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 11 },
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
        return format(date, "dd/MM/yyyy", { locale: vi });
    };

    // Hàm định dạng ngày tháng cho tên file
    const formatDateFilename = (date: Date): string => {
        return format(date, "dd-MM-yyyy", { locale: vi });
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
