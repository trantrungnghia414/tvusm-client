import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { toast } from "sonner";
import { ActivityLogItem } from "../types/activityTypes";

interface ActivityActionsProps {
    activities: ActivityLogItem[];
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

export default function ActivityActions({
    activities,
    onRefresh,
    loading = false,
}: ActivityActionsProps) {
    const handleExport = async () => {
        try {
            // Chuẩn bị dữ liệu xuất
            const exportData = activities.map((activity, index) => ({
                STT: (index + 1).toString(),
                "Thời gian": formatDateTime(activity.timestamp),
                "Loại hoạt động": translateActivityType(activity.type),
                "Hành động": translateAction(activity.action),
                "Mô tả": activity.description,
                "Người thực hiện": activity.user.name,
                Email: activity.user.email,
                "Vai trò": translateRole(activity.user.role),
                "Đối tượng": activity.target?.name || "",
                "Mức độ": translateSeverity(activity.severity),
                "IP Address": activity.ip_address || "N/A",
            }));

            // Phương pháp tạo bảng Excel với tiêu đề
            const title = "NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG";
            const subtitle = "NHÀ THI ĐẤU TRƯỜNG ĐẠI HỌC TRÀ VINH";
            const dateTitle = `Ngày xuất: ${formatDate(
                new Date().toISOString()
            )}`;

            // Tạo mảng cho toàn bộ nội dung worksheet
            const wsData = [
                [subtitle, "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", ""],
                [title, "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", ""],
                [dateTitle, "", "", "", "", "", "", "", "", "", ""],
                ["", "", "", "", "", "", "", "", "", "", ""],
                [
                    "STT",
                    "Thời gian",
                    "Loại hoạt động",
                    "Hành động",
                    "Mô tả",
                    "Người thực hiện",
                    "Email",
                    "Vai trò",
                    "Đối tượng",
                    "Mức độ",
                    "IP Address",
                ],
            ];

            // Thêm dữ liệu hoạt động
            exportData.forEach((activity) => {
                wsData.push([
                    activity.STT,
                    activity["Thời gian"],
                    activity["Loại hoạt động"],
                    activity["Hành động"],
                    activity["Mô tả"],
                    activity["Người thực hiện"],
                    activity.Email,
                    activity["Vai trò"],
                    activity["Đối tượng"],
                    activity["Mức độ"],
                    activity["IP Address"],
                ]);
            });

            // Thêm hàng tổng số hoạt động
            wsData.push(["", "", "", "", "", "", "", "", "", "", ""]);
            wsData.push([
                `Tổng số hoạt động: ${activities.length}`,
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
                font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const subtitleStyle: CellStyle = {
                font: { bold: true, sz: 14, color: { rgb: "374151" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const dateStyle: CellStyle = {
                font: { italic: true, sz: 11, color: { rgb: "6B7280" } },
                alignment: { horizontal: "center", vertical: "center" },
            };

            const headerStyle: CellStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                fill: { fgColor: { rgb: "3B82F6" } },
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
                    top: { style: "thin", color: { rgb: "E5E7EB" } },
                    bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                    left: { style: "thin", color: { rgb: "E5E7EB" } },
                    right: { style: "thin", color: { rgb: "E5E7EB" } },
                },
                alignment: { vertical: "center" },
            };

            // Style cho hàng có nền màu (mỗi 5 hoạt động)
            const coloredRowStyle: CellStyle = {
                ...dataBorderStyle,
                fill: { fgColor: { rgb: "F8FAFC" } }, // Màu xám nhạt
            };

            // Áp dụng style cho tiêu đề
            const titleCell = XLSX.utils.encode_cell({ r: 2, c: 0 });
            if (!ws[titleCell]) ws[titleCell] = {};
            ws[titleCell].s = titleStyle;

            // Áp dụng style cho subtitle
            const subtitleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
            if (!ws[subtitleCell]) ws[subtitleCell] = {};
            ws[subtitleCell].s = subtitleStyle;

            // Áp dụng style cho ngày xuất
            const dateCell = XLSX.utils.encode_cell({ r: 4, c: 0 });
            if (!ws[dateCell]) ws[dateCell] = {};
            ws[dateCell].s = dateStyle;

            // Áp dụng style cho header
            for (let i = 0; i < 11; i++) {
                const cell = XLSX.utils.encode_cell({ r: 6, c: i });
                if (!ws[cell]) ws[cell] = {};
                ws[cell].s = headerStyle;
            }

            // Áp dụng style cho tất cả các ô dữ liệu và thêm màu nền xen kẽ
            exportData.forEach((_, rowIndex) => {
                // Hàng bắt đầu từ 7 (sau header ở hàng 6)
                const currentRow = rowIndex + 7;

                // Xác định style dựa trên nhóm 5 hoạt động
                const currentStyle =
                    Math.floor(rowIndex / 5) % 2 === 0
                        ? coloredRowStyle
                        : dataBorderStyle;

                // Áp dụng style cho từng ô trong hàng
                for (let colIndex = 0; colIndex < 11; colIndex++) {
                    const cell = XLSX.utils.encode_cell({
                        r: currentRow,
                        c: colIndex,
                    });
                    if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                    ws[cell].s = currentStyle;
                }
            });

            // Áp dụng style cho dòng tổng
            const totalRowIndex = exportData.length + 8;
            const totalStyle: CellStyle = {
                font: { bold: true, sz: 12, color: { rgb: "1F2937" } },
                border: {
                    top: { style: "medium", color: { rgb: "374151" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
                alignment: { horizontal: "left", vertical: "center" },
                fill: { fgColor: { rgb: "EFF6FF" } }, // Màu nền xanh nhạt
            };

            // Áp dụng style cho dòng tổng
            for (let i = 0; i < 11; i++) {
                const cell = XLSX.utils.encode_cell({ r: totalRowIndex, c: i });
                if (!ws[cell]) ws[cell] = { v: "", t: "s" };
                ws[cell].s = totalStyle;
            }

            // Thiết lập độ rộng cột
            ws["!cols"] = [
                { wch: 5 }, // STT
                { wch: 18 }, // Thời gian
                { wch: 15 }, // Loại hoạt động
                { wch: 12 }, // Hành động
                { wch: 40 }, // Mô tả
                { wch: 20 }, // Người thực hiện
                { wch: 25 }, // Email
                { wch: 15 }, // Vai trò
                { wch: 25 }, // Đối tượng
                { wch: 12 }, // Mức độ
                { wch: 15 }, // IP Address
            ];

            // Merge cells cho tiêu đề
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, // Subtitle
                { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } }, // Title
                { s: { r: 4, c: 0 }, e: { r: 4, c: 10 } }, // Date
                {
                    s: { r: totalRowIndex, c: 0 },
                    e: { r: totalRowIndex, c: 10 },
                }, // Total row
            ];

            // Tạo workbook và thêm worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Nhật ký hoạt động");

            // Xuất file Excel
            XLSX.writeFile(
                wb,
                `nhat_ky_hoat_dong_${formatDateFilename(new Date())}.xlsx`
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

    // Hàm chuyển đổi loại hoạt động
    const translateActivityType = (type: string): string => {
        switch (type) {
            case "booking":
                return "Đặt sân";
            case "payment":
                return "Thanh toán";
            case "user":
                return "Người dùng";
            case "event":
                return "Sự kiện";
            case "news":
                return "Tin tức";
            case "court":
                return "Sân thể thao";
            case "equipment":
                return "Thiết bị";
            case "maintenance":
                return "Bảo trì";
            case "system":
                return "Hệ thống";
            default:
                return type;
        }
    };

    // Hàm chuyển đổi hành động
    const translateAction = (action: string): string => {
        switch (action) {
            case "create":
                return "Tạo mới";
            case "update":
                return "Cập nhật";
            case "delete":
                return "Xóa";
            case "login":
                return "Đăng nhập";
            case "logout":
                return "Đăng xuất";
            case "register":
                return "Đăng ký";
            case "approve":
                return "Duyệt";
            case "reject":
                return "Từ chối";
            case "cancel":
                return "Hủy";
            case "join":
                return "Tham gia";
            case "leave":
                return "Rời khỏi";
            case "change_password":
                return "Đổi mật khẩu";
            case "update_profile":
                return "Cập nhật hồ sơ";
            default:
                return action;
        }
    };

    // Hàm chuyển đổi vai trò
    const translateRole = (role: string): string => {
        switch (role) {
            case "admin":
                return "Quản trị viên";
            case "staff":
                return "Nhân viên";
            case "technician":
                return "Kỹ thuật viên";
            case "customer":
                return "Khách hàng";
            case "student":
                return "Sinh viên";
            case "teacher":
                return "Giảng viên";
            case "system":
                return "Hệ thống";
            default:
                return role;
        }
    };

    // Hàm chuyển đổi mức độ
    const translateSeverity = (severity: string): string => {
        switch (severity) {
            case "low":
                return "Thấp";
            case "medium":
                return "Trung bình";
            case "high":
                return "Cao";
            case "critical":
                return "Nghiêm trọng";
            default:
                return severity;
        }
    };

    // Hàm định dạng ngày tháng và thời gian
    const formatDateTime = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
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
            <Button
                onClick={onRefresh}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
            >
                <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
            </Button>
            <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
            >
                <FileDown className="h-4 w-4" />
                Xuất Excel
            </Button>
        </div>
    );
}
