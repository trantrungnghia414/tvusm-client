// client/src/app/(admin)/dashboard/rentals/components/RentalTable.tsx
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Package,
    Calendar,
    RotateCcw,
    AlertTriangle,
} from "lucide-react";
import { Rental } from "../types/rental";
import RentalStatusBadge from "./RentalStatusBadge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface RentalTableProps {
    rentals: Rental[];
    onView: (rentalId: number) => void;
    onEdit: (rentalId: number) => void;
    onDelete: (rentalId: number) => void;
    onUpdateStatus: (
        rentalId: number,
        status:
            | "pending"
            | "approved"
            | "active"
            | "returned"
            | "cancelled"
            | "overdue"
    ) => void;
    onUpdatePaymentStatus: (
        rentalId: number,
        status: "pending" | "paid" | "refunded"
    ) => void;
    loading?: boolean;
}

export default function RentalTable({
    rentals,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    onUpdatePaymentStatus,
    loading = false,
}: RentalTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [rentalToDelete, setRentalToDelete] = useState<number | null>(null);

    const handleDeleteClick = (rentalId: number) => {
        setRentalToDelete(rentalId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (rentalToDelete) {
            onDelete(rentalToDelete);
            setDeleteDialogOpen(false);
            setRentalToDelete(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
    };

    if (loading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Thiết bị</TableHead>
                            <TableHead>Thời gian thuê</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (rentals.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Thiết bị</TableHead>
                            <TableHead>Thời gian thuê</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center py-12 text-gray-500"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <Package className="h-12 w-12 text-gray-300" />
                                    <div>
                                        <p className="font-medium">
                                            Không có đơn thuê thiết bị nào
                                        </p>
                                        <p className="text-sm">
                                            Thử thay đổi bộ lọc hoặc thêm đơn
                                            thuê mới
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Thiết bị</TableHead>
                            <TableHead>Thời gian thuê</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rentals.map((rental) => (
                            <TableRow
                                key={rental.rental_id}
                                className="hover:bg-gray-50"
                            >
                                {/* Customer Info */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                                {getInitials(
                                                    rental.user?.fullname ||
                                                        rental.user?.username ||
                                                        "U"
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {rental.user?.fullname ||
                                                    rental.user?.username ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                {rental.user?.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {rental.user.email}
                                                    </span>
                                                )}
                                                {rental.user?.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {rental.user.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Equipment Info */}
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {rental.equipment?.name || "N/A"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {rental.equipment?.code} •{" "}
                                            {rental.equipment?.category_name}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Package className="h-3 w-3" />
                                            Số lượng: {rental.quantity}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            #RE
                                            {rental.rental_id
                                                .toString()
                                                .padStart(4, "0")}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Rental Period */}
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {calculateDays(
                                                rental.start_date,
                                                rental.end_date
                                            )}{" "}
                                            ngày
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(
                                                new Date(rental.start_date),
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            đến{" "}
                                            {format(
                                                new Date(rental.end_date),
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Total Amount */}
                                <TableCell>
                                    <div className="font-medium text-gray-900">
                                        {formatCurrency(rental.total_amount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {rental.equipment?.rental_fee &&
                                            formatCurrency(
                                                rental.equipment.rental_fee
                                            )}{" "}
                                        / ngày
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <RentalStatusBadge
                                        status={rental.status}
                                        paymentStatus={rental.payment_status}
                                        size="sm"
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
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
                                                    onView(rental.rental_id)
                                                }
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit(rental.rental_id)
                                                }
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>
                                                Cập nhật trạng thái
                                            </DropdownMenuLabel>

                                            {/* Status Updates */}
                                            {rental.status === "pending" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            rental.rental_id,
                                                            "approved"
                                                        )
                                                    }
                                                    className="text-green-600"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Duyệt đơn
                                                </DropdownMenuItem>
                                            )}

                                            {rental.status === "approved" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            rental.rental_id,
                                                            "active"
                                                        )
                                                    }
                                                    className="text-blue-600"
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    Bắt đầu thuê
                                                </DropdownMenuItem>
                                            )}

                                            {rental.status === "active" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            rental.rental_id,
                                                            "returned"
                                                        )
                                                    }
                                                    className="text-emerald-600"
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                    Đánh dấu đã trả
                                                </DropdownMenuItem>
                                            )}

                                            {["pending", "approved"].includes(
                                                rental.status
                                            ) && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            rental.rental_id,
                                                            "cancelled"
                                                        )
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Hủy đơn thuê
                                                </DropdownMenuItem>
                                            )}

                                            {rental.status === "active" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            rental.rental_id,
                                                            "overdue"
                                                        )
                                                    }
                                                    className="text-orange-600"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Đánh dấu quá hạn
                                                </DropdownMenuItem>
                                            )}

                                            {/* Payment Status Updates */}
                                            {rental.payment_status ===
                                                "pending" &&
                                                rental.status !==
                                                    "cancelled" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>
                                                            Thanh toán
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onUpdatePaymentStatus(
                                                                    rental.rental_id,
                                                                    "paid"
                                                                )
                                                            }
                                                            className="text-green-600"
                                                        >
                                                            <DollarSign className="h-4 w-4 mr-2" />
                                                            Đánh dấu đã thanh
                                                            toán
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                            {rental.payment_status === "paid" &&
                                                rental.status ===
                                                    "cancelled" && (
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onUpdatePaymentStatus(
                                                                rental.rental_id,
                                                                "refunded"
                                                            )
                                                        }
                                                        className="text-purple-600"
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Hoàn tiền
                                                    </DropdownMenuItem>
                                                )}

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        rental.rental_id
                                                    )
                                                }
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa đơn thuê thiết bị
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đơn thuê thiết bị này?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
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
