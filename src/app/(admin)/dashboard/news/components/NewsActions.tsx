import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { News } from "../types/newsTypes";

interface NewsActionsProps {
    onAddNews: () => void;
    news?: News[];
}

export default function NewsActions({
    onAddNews,
    news = [],
}: NewsActionsProps) {
    // Hàm xuất file Excel
    const handleExport = async () => {
        try {
            const dataToExport = news;

            // Nếu không có dữ liệu, hiển thị thông báo
            if (dataToExport.length === 0) {
                toast.info("Không có dữ liệu để xuất");
                return;
            }

            // Chuẩn bị tiêu đề và các biến cần thiết
            const title = "DANH SÁCH TIN TỨC";
            const subtitle = "HỆ THỐNG QUẢN LÝ NHÀ THI ĐẤU TVU";
            const dateTitle = `Ngày xuất báo cáo: ${format(
                new Date(),
                "dd/MM/yyyy HH:mm",
                { locale: vi }
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", ""],
                ["", "", "", "", "", "", ""],
                [title, "", "", "", "", "", ""],
                ["", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", ""],
                ["", "", "", "", "", "", ""],
                [
                    "STT",
                    "Tiêu đề",
                    "Danh mục",
                    "Tác giả",
                    "Trạng thái",
                    "Lượt xem",
                    "Ngày xuất bản",
                ],
            ];

            // Thêm dữ liệu tin tức
            dataToExport.forEach((item, index) => {
                wsData.push([
                    (index + 1).toString(),
                    item.title,
                    item.category_name || "Chưa phân loại",
                    item.author_name || "Không có tác giả",
                    translateStatus(item.status),
                    item.view_count.toString(),
                    item.published_at
                        ? formatDate(item.published_at)
                        : "Chưa xuất bản",
                ]);
            });

            // Thêm hàng tổng số tin tức
            const totalRowIndex = wsData.length;
            wsData.push(["", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số tin tức: ${dataToExport.length}`,
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

            // Style cho header
            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };

            // Style cho dữ liệu
            const dataBorderStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { vertical: "center" },
            };

            // Style cho hàng có nền màu (mỗi 5 tin tức)
            const coloredRowStyle = {
                ...dataBorderStyle,
                fill: { fgColor: { rgb: "E6F0FF" } }, // Màu xanh nhạt
            };

            // Style cho hàng tổng
            const totalStyle = {
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

            // Áp dụng style cho tiêu đề
            ws["A3"] = { v: title, t: "s" };
            ws["A3"].s = titleStyle;

            // Merge cells cho tiêu đề
            if (!ws["!merges"]) ws["!merges"] = [];
            ws["!merges"].push(
                { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // A3:G3
                { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // A1:G1
                { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } } // A5:G5
            );

            // Áp dụng style cho subtitle và date
            ws["A1"] = { v: subtitle, t: "s" };
            ws["A1"].s = subtitleStyle;

            ws["A5"] = { v: dateTitle, t: "s" };
            ws["A5"].s = dateStyle;

            // Áp dụng style cho header
            for (let i = 0; i < 7; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho tất cả các ô dữ liệu và thêm màu nền xen kẽ
            dataToExport.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 tin tức
                // Math.floor(rowIndex / 5) % 2 sẽ cho giá trị 0 hoặc 1 mỗi 5 dòng
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let i = 0; i < 7; i++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: i,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Áp dụng style cho dòng tổng
            for (let i = 0; i < 7; i++) {
                const cell = XLSX.utils.encode_cell({
                    r: totalRowIndex + 1,
                    c: i,
                });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 40 }, // Tiêu đề
                { wch: 15 }, // Danh mục
                { wch: 20 }, // Tác giả
                { wch: 15 }, // Trạng thái
                { wch: 10 }, // Lượt xem
                { wch: 20 }, // Ngày xuất bản
            ];

            // Thiết lập độ cao hàng
            ws["!rows"] = [];
            for (let i = 0; i < wsData.length; i++) {
                ws["!rows"][i] = { hpt: 24 }; // hpt là height points
            }

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách tin tức");

            // Xuất file
            const fileName = `Danh_sach_tin_tuc_${format(
                new Date(),
                "dd-MM-yyyy_HH-mm"
            )}.xlsx`;
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
            case "published":
                return "Đã xuất bản";
            case "draft":
                return "Bản nháp";
            case "archived":
                return "Đã lưu trữ";
            default:
                return status;
        }
    };

    // Hàm định dạng ngày tháng
    const formatDate = (dateString: string): string => {
        if (!dateString) return "";
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    return (
        <div className="flex space-x-2">
            <Button onClick={handleExport} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
            <Button onClick={onAddNews} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Thêm tin tức
            </Button>
        </div>
    );
}
