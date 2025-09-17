// client/src/app/(admin)/dashboard/payments/components/PaymentActions.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Download,
    RefreshCw,
    MoreHorizontal,
    FileSpreadsheet,
    FileText,
    DollarSign,
    Receipt,
} from "lucide-react";
import { Payment, CreatePaymentDto } from "../types/payment";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { formatCurrency } from "@/lib/utils";

interface PaymentActionsProps {
    payments: Payment[];
    onRefresh: () => void;
    onCreatePayment?: (data: CreatePaymentDto) => void;
    loading?: boolean;
}

export default function PaymentActions({
    payments,
    onRefresh,
    onCreatePayment,
    loading = false,
}: PaymentActionsProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [formData, setFormData] = useState<CreatePaymentDto>({
        user_id: 0,
        amount: 0,
        payment_method: "cash",
    });

    const handleExportExcel = () => {
        try {
            const exportData = payments.map((payment) => ({
                "Mã GD": `PAY${payment.payment_id.toString().padStart(6, "0")}`,
                "Khách hàng":
                    payment.user?.fullname || payment.user?.username || "N/A",
                Email: payment.user?.email || "",
                "Số điện thoại": payment.user?.phone || "",
                Loại: payment.booking_id ? "Đặt sân" : "Thuê thiết bị",
                "Số tiền": payment.amount,
                "Phương thức": getPaymentMethodLabel(payment.payment_method),
                "Trạng thái": getPaymentStatusLabel(payment.status),
                "Mã giao dịch": payment.transaction_id || "",
                "Ngày tạo": new Date(payment.created_at).toLocaleDateString(
                    "vi-VN"
                ),
                "Ngày thanh toán": payment.paid_at
                    ? new Date(payment.paid_at).toLocaleDateString("vi-VN")
                    : "",
                "Ghi chú": payment.notes || "",
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Thanh toán");

            // Set column widths
            const colWidths = [
                { wch: 12 }, // Mã GD
                { wch: 20 }, // Khách hàng
                { wch: 25 }, // Email
                { wch: 15 }, // Số điện thoại
                { wch: 12 }, // Loại
                { wch: 15 }, // Số tiền
                { wch: 15 }, // Phương thức
                { wch: 12 }, // Trạng thái
                { wch: 20 }, // Mã giao dịch
                { wch: 12 }, // Ngày tạo
                { wch: 15 }, // Ngày thanh toán
                { wch: 30 }, // Ghi chú
            ];
            ws["!cols"] = colWidths;

            const fileName = `thanh-toan_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success(`Đã xuất ${payments.length} giao dịch ra file Excel`);
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Không thể xuất file Excel");
        }
    };

    const handleExportPDF = () => {
        // Implement PDF export logic here
        toast.info("Tính năng xuất PDF đang được phát triển");
    };

    const handleCreatePayment = async () => {
        try {
            if (!formData.user_id || !formData.amount || formData.amount <= 0) {
                toast.error("Vui lòng điền đầy đủ thông tin");
                return;
            }

            if (onCreatePayment) {
                await onCreatePayment(formData);
                setCreateDialogOpen(false);
                setFormData({
                    user_id: 0,
                    amount: 0,
                    payment_method: "cash",
                });
                toast.success("Tạo giao dịch thanh toán thành công");
            }
        } catch (error) {
            console.error("Error creating payment:", error);
            toast.error("Không thể tạo giao dịch thanh toán");
        }
    };

    const getPaymentMethodLabel = (method: Payment["payment_method"]) => {
        switch (method) {
            case "cash":
                return "Tiền mặt";
            case "bank_transfer":
                return "Chuyển khoản";
            case "vnpay":
                return "VNPay";
            case "momo":
                return "MoMo";
            default:
                return "Khác";
        }
    };

    const getPaymentStatusLabel = (status: Payment["status"]) => {
        switch (status) {
            case "pending":
                return "Chờ xử lý";
            case "completed":
                return "Thành công";
            case "failed":
                return "Thất bại";
            case "refunded":
                return "Đã hoàn tiền";
            case "cancelled":
                return "Đã hủy";
            default:
                return "Không xác định";
        }
    };

    // ✅ Sửa lại tính toán totalAmount với xử lý an toàn
    const totalAmount = payments.reduce((sum, payment) => {
        // Kiểm tra payment.amount có hợp lệ không
        const amount = payment.amount;
        if (
            payment.status === "completed" &&
            amount !== null &&
            amount !== undefined &&
            !isNaN(Number(amount)) &&
            Number(amount) > 0
        ) {
            return sum + Number(amount);
        }
        return sum;
    }, 0);

    // ✅ Thêm function helper để format an toàn
    const safeFormatCurrency = (amount: number): string => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0 ₫";
        }
        return formatCurrency(amount);
    };

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tổng thu hiện tại</p>
                            <p className="text-lg font-bold text-green-600">
                                {safeFormatCurrency(totalAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Tổng giao dịch
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                                {payments.length.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                    size="sm"
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                    Làm mới
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Xuất dữ liệu
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleExportExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Xuất Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                            <FileText className="h-4 w-4 mr-2" />
                            Xuất PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <span className="text-xs text-gray-500">
                                {payments.length} giao dịch
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {onCreatePayment && (
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo giao dịch
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                toast.info("Tính năng đang phát triển")
                            }
                        >
                            Gửi báo cáo email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                toast.info("Tính năng đang phát triển")
                            }
                        >
                            Đồng bộ dữ liệu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                toast.info("Tính năng đang phát triển")
                            }
                        >
                            Cài đặt thông báo
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Create Payment Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tạo giao dịch thanh toán</DialogTitle>
                        <DialogDescription>
                            Tạo giao dịch thanh toán thủ công cho khách hàng
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="user_id">ID Khách hàng *</Label>
                            <Input
                                id="user_id"
                                type="number"
                                placeholder="Nhập ID khách hàng"
                                value={formData.user_id || ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        user_id: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="amount">Số tiền *</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Nhập số tiền"
                                value={formData.amount || ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        amount: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment_method">
                                Phương thức thanh toán *
                            </Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={(
                                    value: Payment["payment_method"]
                                ) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        payment_method: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">
                                        Tiền mặt
                                    </SelectItem>
                                    <SelectItem value="bank_transfer">
                                        Chuyển khoản
                                    </SelectItem>
                                    <SelectItem value="vnpay">VNPay</SelectItem>
                                    <SelectItem value="momo">MoMo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="transaction_id">Mã giao dịch</Label>
                            <Input
                                id="transaction_id"
                                placeholder="Nhập mã giao dịch (tùy chọn)"
                                value={formData.transaction_id || ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        transaction_id: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ghi chú thêm..."
                                value={formData.notes || ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleCreatePayment}>
                            Tạo giao dịch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
