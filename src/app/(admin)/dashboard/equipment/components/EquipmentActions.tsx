import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { fetchApi } from "@/lib/api";
import { Equipment } from "../types/equipmentTypes";

interface EquipmentActionsProps {
    onAddEquipment: () => void;
    equipment?: Equipment[];
}

export default function EquipmentActions({
    onAddEquipment,
    equipment = [],
}: EquipmentActionsProps) {
    const handleExport = async () => {
        try {
            // Nếu không có dữ liệu equipment được truyền vào, lấy từ API
            let dataToExport = equipment;

            if (!equipment.length) {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    return;
                }

                const response = await fetchApi("/equipment", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách thiết bị");
                }

                dataToExport = await response.json();
            }

            // Phương pháp đơn giản hơn để tạo bảng Excel với tiêu đề
            const title = "DANH SÁCH THIẾT BỊ";
            const subtitle = "NHÀ THI ĐẤU TRƯỜNG ĐẠI HỌC TRÀ VINH";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Mã thiết bị",
                    "Tên thiết bị",
                    "Danh mục",
                    "Khu vực/Nhà thi đấu",
                    "Số lượng",
                    "Số lượng khả dụng",
                    "Trạng thái",
                    "Phí thuê/giờ",
                    "Ngày mua",
                ],
            ];

            // Thêm dữ liệu thiết bị
            dataToExport.forEach((item, index) => {
                wsData.push([
                    (index + 1).toString(),
                    item.code,
                    item.name,
                    item.category_name || "Không xác định",
                    item.venue_name || "Chung",
                    item.quantity.toString(),
                    item.available_quantity.toString(),
                    translateStatus(item.status),
                    formatCurrency(item.rental_fee),
                    item.purchase_date ? formatDate(item.purchase_date) : "",
                ]);
            });

            // Thêm hàng tổng số thiết bị
            wsData.push(["", "", "", "", "", "", "", "", "", ""]);
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
            ]);

            // Tạo worksheet từ mảng dữ liệu
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Định nghĩa các styles
            const titleStyle = {
                font: { bold: true, sz: 16 },
                alignment: { horizontal: "center" },
            };

            const subtitleStyle = {
                font: { bold: true, sz: 14 },
                alignment: { horizontal: "center" },
            };

            const dateStyle = {
                font: { italic: true, sz: 12 },
                alignment: { horizontal: "right" },
            };

            const headerStyle = {
                font: { bold: true, sz: 12 },
                fill: { fgColor: { rgb: "E9E9E9" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                },
            };

            // Áp dụng styles
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 9 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 9 },
                }, // Total row
            ];

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
            for (let i = 0; i < 10; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Thiết bị");

            // Điều chỉnh chiều rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 10 }, // Mã thiết bị
                { wch: 25 }, // Tên thiết bị
                { wch: 15 }, // Danh mục
                { wch: 20 }, // Khu vực/Nhà thi đấu
                { wch: 10 }, // Số lượng
                { wch: 15 }, // Số lượng khả dụng
                { wch: 15 }, // Trạng thái
                { wch: 15 }, // Phí thuê/giờ
                { wch: 15 }, // Ngày mua
            ];

            // Tạo file Excel và tải về
            XLSX.writeFile(
                wb,
                `danh_sach_thiet_bi_${formatDateFilename(new Date())}.xlsx`
            );
            toast.success("Xuất danh sách thiết bị thành công");
        } catch (error) {
            console.error("Error exporting equipment data:", error);
            toast.error("Không thể xuất danh sách thiết bị");
        }
    };

    // Hàm chuyển đổi trạng thái từ tiếng Anh sang tiếng Việt
    const translateStatus = (status: string): string => {
        switch (status) {
            case "available":
                return "Sẵn sàng";
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

    // Hàm định dạng ngày
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Hàm định dạng ngày cho tên file
    const formatDateFilename = (date: Date): string => {
        return date.toISOString().split("T")[0];
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="flex gap-2">
            <Button onClick={onAddEquipment}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thiết bị mới
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
