// client/src/app/(admin)/dashboard/payments/components/PaymentTable.tsx
"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Copy,
    ExternalLink,
} from "lucide-react";
import { Payment } from "../types/payment";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface PaymentTableProps {
    payments: Payment[];
    onView: (paymentId: number) => void;
    onEdit: (paymentId: number) => void;
    onDelete: (paymentId: number) => void;
    onUpdateStatus: (paymentId: number, status: Payment["status"]) => void;
    loading?: boolean;
}

export default function PaymentTable({
    payments,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    loading = false,
}: PaymentTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
        null
    );

    const handleDeleteClick = (paymentId: number) => {
        setSelectedPaymentId(paymentId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedPaymentId) {
            onDelete(selectedPaymentId);
            setDeleteDialogOpen(false);
            setSelectedPaymentId(null);
        }
    };

    const handleCopyTransactionId = (transactionId: string) => {
        navigator.clipboard.writeText(transactionId);
        toast.success("Đã sao chép mã giao dịch");
    };

    const getPaymentType = (payment: Payment) => {
        if (payment.booking_id) return "Đặt sân";
        if (payment.rental_id) return "Thuê thiết bị";
        return "Khác";
    };

    const getRelatedInfo = (payment: Payment) => {
        if (payment.booking && payment.booking_id) {
            return {
                type: "Đặt sân",
                name: payment.booking.court_name,
                detail: `${format(
                    new Date(payment.booking.booking_date),
                    "dd/MM/yyyy"
                )} • ${payment.booking.start_time}-${payment.booking.end_time}`,
                id: payment.booking_id,
            };
        }
        if (payment.rental && payment.rental_id) {
            return {
                type: "Thuê thiết bị",
                name: payment.rental.equipment_name,
                detail: `${format(
                    new Date(payment.rental.start_date),
                    "dd/MM/yyyy"
                )} - ${format(
                    new Date(payment.rental.end_date),
                    "dd/MM/yyyy"
                )} • SL: ${payment.rental.quantity}`,
                id: payment.rental_id,
            };
        }
        return null;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-4 animate-pulse"
                            >
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/12"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (payments.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <Eye className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không tìm thấy giao dịch
                            </h3>
                            <p className="text-gray-600">
                                Không có giao dịch thanh toán nào phù hợp với bộ
                                lọc hiện tại
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-medium">
                                        Mã GD
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Khách hàng
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Loại
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Số tiền
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Phương thức
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="font-medium">
                                        Ngày tạo
                                    </TableHead>
                                    <TableHead className="font-medium text-center">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => {
                                    const relatedInfo = getRelatedInfo(payment);

                                    return (
                                        <TableRow
                                            key={payment.payment_id}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell>
                                                <div className="font-medium">
                                                    PAY
                                                    {payment.payment_id
                                                        .toString()
                                                        .padStart(6, "0")}
                                                </div>
                                                {payment.transaction_id && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            {payment.transaction_id.slice(
                                                                0,
                                                                10
                                                            )}
                                                            ...
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0"
                                                            onClick={() =>
                                                                handleCopyTransactionId(
                                                                    payment.transaction_id!
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-medium">
                                                    {payment.user?.fullname ||
                                                        payment.user
                                                            ?.username ||
                                                        "N/A"}
                                                </div>
                                                {payment.user?.email && (
                                                    <div className="text-sm text-gray-600">
                                                        {payment.user.email}
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-medium">
                                                    {getPaymentType(payment)}
                                                </div>
                                                {relatedInfo && (
                                                    <div className="text-sm text-gray-600">
                                                        <div className="font-medium">
                                                            {relatedInfo.name}
                                                        </div>
                                                        <div className="text-xs">
                                                            {relatedInfo.detail}
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="font-bold text-lg">
                                                    {formatCurrency(
                                                        payment.amount
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <PaymentMethodBadge
                                                    method={
                                                        payment.payment_method
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <PaymentStatusBadge
                                                    status={payment.status}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(
                                                        new Date(
                                                            payment.created_at
                                                        ),
                                                        "dd/MM/yyyy",
                                                        { locale: vi }
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {format(
                                                        new Date(
                                                            payment.created_at
                                                        ),
                                                        "HH:mm",
                                                        { locale: vi }
                                                    )}
                                                </div>
                                                {payment.paid_at && (
                                                    <div className="text-xs text-green-600 mt-1">
                                                        Thanh toán:{" "}
                                                        {format(
                                                            new Date(
                                                                payment.paid_at
                                                            ),
                                                            "dd/MM HH:mm",
                                                            { locale: vi }
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            align="end"
                                                            className="w-48"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onView(
                                                                        payment.payment_id
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Xem chi tiết
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onEdit(
                                                                        payment.payment_id
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Chỉnh sửa
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            {payment.status ===
                                                                "pending" && (
                                                                <>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            onUpdateStatus(
                                                                                payment.payment_id,
                                                                                "completed"
                                                                            )
                                                                        }
                                                                        className="text-green-600"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                        Xác nhận
                                                                        thành
                                                                        công
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            onUpdateStatus(
                                                                                payment.payment_id,
                                                                                "failed"
                                                                            )
                                                                        }
                                                                        className="text-red-600"
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Đánh dấu
                                                                        thất bại
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            {payment.status ===
                                                                "completed" && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        onUpdateStatus(
                                                                            payment.payment_id,
                                                                            "refunded"
                                                                        )
                                                                    }
                                                                    className="text-blue-600"
                                                                >
                                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                                    Hoàn tiền
                                                                </DropdownMenuItem>
                                                            )}

                                                            {relatedInfo && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            const path =
                                                                                relatedInfo.type ===
                                                                                "Đặt sân"
                                                                                    ? `/dashboard/bookings/${relatedInfo.id}`
                                                                                    : `/dashboard/rentals/${relatedInfo.id}`;
                                                                            window.open(
                                                                                path,
                                                                                "_blank"
                                                                            );
                                                                        }}
                                                                    >
                                                                        <ExternalLink className="h-4 w-4 mr-2" />
                                                                        Xem{" "}
                                                                        {
                                                                            relatedInfo.type
                                                                        }
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        payment.payment_id
                                                                    )
                                                                }
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Xóa
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa giao dịch
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa giao dịch thanh toán này?
                            Hành động này không thể hoàn tác và có thể ảnh hưởng
                            đến dữ liệu liên quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
