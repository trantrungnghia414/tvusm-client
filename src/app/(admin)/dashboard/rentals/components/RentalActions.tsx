// client/src/app/(admin)/dashboard/rentals/components/RentalActions.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileDown, Calendar } from "lucide-react";
import { Rental } from "../types/rental";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface RentalActionsProps {
    onAddRental: () => void;
    rentals: Rental[];
    onRefresh: () => void;
    loading: boolean;
}

export default function RentalActions({
    onAddRental,
    rentals,
    onRefresh,
    loading,
}: RentalActionsProps) {
    const handleExport = () => {
        try {
            const exportData = rentals.map((rental, index) => ({
                STT: index + 1,
                "Mã đơn": `RE${rental.rental_id.toString().padStart(4, "0")}`,
                "Khách hàng":
                    rental.user?.fullname || rental.user?.username || "N/A",
                Email: rental.user?.email || "",
                "Số điện thoại": rental.user?.phone || "",
                "Thiết bị": rental.equipment?.name || "N/A",
                "Mã thiết bị": rental.equipment?.code || "",
                "Số lượng": rental.quantity,
                "Ngày bắt đầu": format(
                    new Date(rental.start_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                ),
                "Ngày kết thúc": format(
                    new Date(rental.end_date),
                    "dd/MM/yyyy",
                    { locale: vi }
                ),
                "Số ngày": Math.ceil(
                    (new Date(rental.end_date).getTime() -
                        new Date(rental.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                ),
                "Tổng tiền": rental.total_amount.toLocaleString("vi-VN") + "đ",
                "Trạng thái": getStatusText(rental.status),
                "Thanh toán": getPaymentStatusText(rental.payment_status),
                "Ngày tạo": format(
                    new Date(rental.created_at),
                    "dd/MM/yyyy HH:mm",
                    { locale: vi }
                ),
                "Ghi chú": rental.notes || "",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();

            // Set column widths
            const colWidths = [
                { wch: 5 }, // STT
                { wch: 12 }, // Mã đơn
                { wch: 20 }, // Khách hàng
                { wch: 25 }, // Email
                { wch: 15 }, // Số điện thoại
                { wch: 25 }, // Thiết bị
                { wch: 15 }, // Mã thiết bị
                { wch: 10 }, // Số lượng
                { wch: 12 }, // Ngày bắt đầu
                { wch: 12 }, // Ngày kết thúc
                { wch: 10 }, // Số ngày
                { wch: 15 }, // Tổng tiền
                { wch: 15 }, // Trạng thái
                { wch: 15 }, // Thanh toán
                { wch: 18 }, // Ngày tạo
                { wch: 30 }, // Ghi chú
            ];
            ws["!cols"] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, "Danh sách thuê thiết bị");

            const fileName = `danh-sach-thue-thiet-bi-${format(
                new Date(),
                "dd-MM-yyyy"
            )}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success("Xuất file Excel thành công");
        } catch (error) {
            console.error("Error exporting Excel:", error);
            toast.error("Không thể xuất file Excel");
        }
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: "Chờ duyệt",
            approved: "Đã duyệt",
            active: "Đang thuê",
            returned: "Đã trả",
            cancelled: "Đã hủy",
            overdue: "Quá hạn",
        };
        return statusMap[status] || status;
    };

    const getPaymentStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: "Chưa thanh toán",
            paid: "Đã thanh toán",
            refunded: "Đã hoàn tiền",
        };
        return statusMap[status] || status;
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Button onClick={onAddRental}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm đơn thuê
                </Button>

                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Làm mới
                </Button>

                <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={rentals.length === 0}
                >
                    <FileDown className="h-4 w-4 mr-2" />
                    Xuất Excel
                </Button>
            </div>

            <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Cập nhật lúc:{" "}
                {format(new Date(), "HH:mm dd/MM/yyyy", { locale: vi })}
            </div>
        </div>
    );
}
