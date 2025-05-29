import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown, Database } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { News } from "../types/newsTypes";
import { useRouter } from "next/navigation";

interface NewsActionsProps {
    onAddNews: () => void;
    news: News[];
}

// Định nghĩa kiểu cho cell style
interface CellStyle {
    font?: {
        bold?: boolean;
        sz?: number;
        color?: { rgb: string };
    };
    fill?: {
        fgColor: { rgb: string };
    };
    alignment?: {
        vertical?: string;
        horizontal?: string;
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
    };
}

export default function NewsActions({
    onAddNews,
    news = [],
}: NewsActionsProps) {
    // Hàm xuất Excel
    const handleExport = async () => {
        try {
            if (news.length === 0) {
                toast.error("Không có dữ liệu để xuất");
                return;
            }

            const fileName = `Danh_sach_tin_tuc_${formatDateFilename(
                new Date()
            )}.xlsx`;

            // Tiêu đề cho file Excel
            const title = "DANH SÁCH TIN TỨC";
            const subtitle = "HỆ THỐNG QUẢN LÝ CƠ SỞ VẬT CHẤT THỂ THAO TVU";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

            // Dữ liệu sẽ xuất ra Excel
            const dataToExport = news.map((item) => ({
                news_id: item.news_id,
                title: item.title,
                category_id: item.category_id,
                category_name: item.category_name || "",
                summary: item.summary || "",
                status: item.status,
                view_count: item.view_count,
                is_featured: item.is_featured,
                is_internal: item.is_internal,
                published_at: item.published_at || "",
                created_at: item.created_at,
                updated_at: item.updated_at,
                author_id: item.author_id,
                author_name: item.author_name || "",
            }));

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Tiêu đề",
                    "Danh mục",
                    "Trạng thái",
                    "Lượt xem",
                    "Nổi bật",
                    "Ngày đăng",
                    "Tác giả",
                ],
            ];

            // Thêm dữ liệu tin tức
            dataToExport.forEach((item, index) => {
                wsData.push([
                    (index + 1).toString(),
                    item.title,
                    item.category_name || `Danh mục ${item.category_id}`,
                    translateStatus(item.status),
                    item.view_count.toString(),
                    item.is_featured === 1 ? "Có" : "Không",
                    item.published_at
                        ? formatDate(item.published_at)
                        : "Chưa đăng",
                    item.author_name || `Tác giả ${item.author_id}`,
                ]);
            });

            // Thêm hàng tổng số tin tức
            wsData.push(["", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số tin tức: ${dataToExport.length}`,
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
                alignment: { horizontal: "center" },
            };

            const headerStyle: CellStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F46E5" } },
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

            // Style cho hàng có nền màu (mỗi 5 tin tức)
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
            for (let i = 0; i < 8; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho dữ liệu và thêm màu nền xen kẽ
            dataToExport.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 tin tức
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 8; colIndex++) {
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
            for (let i = 0; i < 8; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 40 }, // Tiêu đề
                { wch: 20 }, // Danh mục
                { wch: 15 }, // Trạng thái
                { wch: 10 }, // Lượt xem
                { wch: 10 }, // Nổi bật
                { wch: 20 }, // Ngày đăng
                { wch: 20 }, // Tác giả
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 7 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách tin tức");

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
            case "published":
                return "Đã đăng";
            case "draft":
                return "Nháp";
            case "archived":
                return "Đã lưu trữ";
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

    const router = useRouter();

    // Hàm chuyển đến trang quản lý danh mục tin tức
    const handleGoToCategories = () => {
        router.push("/dashboard/news-categories");
    };

    return (
        <div className="flex gap-2">
            <Button onClick={onAddNews}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm tin tức
            </Button>
            {/* Thêm nút chuyển đến trang quản lý danh mục */}
            <Button variant="outline" onClick={handleGoToCategories}>
                <Database className="mr-2 h-4 w-4" />
                Quản lý danh mục
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
