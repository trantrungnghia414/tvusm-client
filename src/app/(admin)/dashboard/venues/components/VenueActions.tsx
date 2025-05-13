import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Venue } from "../types/venueTypes";

// Interface cho API response
interface VenueApiResponse {
    venue_id: number;
    name: string;
    location: string;
    description?: string;
    capacity?: number;
    status: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

interface VenueActionsProps {
    onAddVenue: () => void;
    venues?: Venue[];
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

export default function VenueActions({
    onAddVenue,
    venues = [],
}: VenueActionsProps) {
    const handleExport = async () => {
        try {
            // Nếu không có dữ liệu venues được truyền vào, lấy từ API
            let dataToExport = venues;

            if (venues.length === 0) {
                // Lấy token từ localStorage
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    return;
                }

                // Fetch dữ liệu từ API
                const response = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải danh sách nhà thi đấu");
                }

                const data = await response.json();
                // Chuyển đổi dữ liệu từ API sang định dạng cần thiết
                dataToExport = data.map((venue: VenueApiResponse) => ({
                    venue_id: venue.venue_id,
                    name: venue.name,
                    location: venue.location,
                    description: venue.description || "",
                    capacity: venue.capacity || 0,
                    status: venue.status,
                    image: venue.image,
                    created_at: venue.created_at,
                    updated_at: venue.updated_at,
                }));
            }

            // Phương pháp đơn giản hơn để tạo bảng Excel với tiêu đề
            const title = "DANH SÁCH NHÀ THI ĐẤU";
            const subtitle = "NHÀ THI ĐẤU TRƯỜNG ĐẠI HỌC TRÀ VINH";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
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
                    "Tên nhà thi đấu",
                    "Địa điểm",
                    "Sức chứa",
                    "Trạng thái",
                    "Ngày tạo",
                    "Cập nhật lần cuối",
                ],
            ];

            // Thêm dữ liệu nhà thi đấu
            dataToExport.forEach((venue, index) => {
                wsData.push([
                    (index + 1).toString(),
                    venue.name,
                    venue.location,
                    venue.capacity?.toString() || "Chưa có thông tin",
                    translateStatus(venue.status),
                    formatDate(venue.created_at),
                    formatDate(venue.updated_at),
                ]);
            });

            // Thêm hàng tổng số nhà thi đấu
            wsData.push(["", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số nhà thi đấu: ${dataToExport.length}`,
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
                alignment: { horizontal: "center", vertical: "center" },
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

            // Style cho hàng có nền màu (mỗi 5 nhà thi đấu)
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
            for (let i = 0; i < 7; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho tất cả các ô dữ liệu và thêm màu nền xen kẽ
            dataToExport.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 nhà thi đấu
                // Math.floor(rowIndex / 5) % 2 sẽ cho giá trị 0 hoặc 1 mỗi 5 dòng
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 7; colIndex++) {
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
            for (let i = 0; i < 7; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 25 }, // Tên nhà thi đấu
                { wch: 30 }, // Địa điểm
                { wch: 12 }, // Sức chứa
                { wch: 20 }, // Trạng thái
                { wch: 20 }, // Ngày tạo
                { wch: 20 }, // Cập nhật lần cuối
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } }, // Date
                {
                    s: { r: dataToExport.length + 8, c: 0 },
                    e: { r: dataToExport.length + 8, c: 6 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhà thi đấu");

            // Xuất file Excel
            XLSX.writeFile(
                wb,
                `danh_sach_nha_thi_dau_${formatDateFilename(new Date())}.xlsx`
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
            case "active":
                return "Đang hoạt động";
            case "maintenance":
                return "Đang bảo trì";
            case "inactive":
                return "Tạm ngưng";
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
            <Button onClick={onAddVenue}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhà thi đấu
            </Button>
            <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
