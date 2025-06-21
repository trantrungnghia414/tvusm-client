// client/src/app/(admin)/dashboard/bookings/components/BookingTable.tsx
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
} from "lucide-react";
import { Booking } from "../types/booking";
import BookingStatusBadge from "./BookingStatusBadge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface BookingTableProps {
    bookings: Booking[];
    onView: (bookingId: number) => void;
    onEdit: (bookingId: number) => void;
    onDelete: (bookingId: number) => void;
    onUpdateStatus: (
        bookingId: number,
        status: "pending" | "confirmed" | "completed" | "cancelled"
    ) => void;
    onUpdatePaymentStatus: (
        bookingId: number,
        status: "pending" | "paid" | "refunded"
    ) => void;
    loading?: boolean;
}

export default function BookingTable({
    bookings,
    onView,
    onEdit,
    onDelete,
    onUpdateStatus,
    onUpdatePaymentStatus,
    loading = false,
}: BookingTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

    const handleDeleteClick = (bookingId: number) => {
        setBookingToDelete(bookingId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (bookingToDelete) {
            onDelete(bookingToDelete);
            setDeleteDialogOpen(false);
            setBookingToDelete(null);
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

    if (loading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Sân</TableHead>
                            <TableHead>Ngày & Giờ</TableHead>
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
                                            <div className="h-3 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
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

    if (bookings.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Sân</TableHead>
                            <TableHead>Ngày & Giờ</TableHead>
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
                                    <Clock className="h-12 w-12 text-gray-300" />
                                    <div>
                                        <p className="font-medium">
                                            Không có đặt sân nào
                                        </p>
                                        <p className="text-sm">
                                            Thử thay đổi bộ lọc hoặc thêm đặt
                                            sân mới
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
                            <TableHead>Sân</TableHead>
                            <TableHead>Ngày & Giờ</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.map((booking) => (
                            <TableRow
                                key={booking.booking_id}
                                className="hover:bg-gray-50"
                            >
                                {/* Customer Info */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            {/* ✅ Xóa AvatarImage vì không có avatar */}
                                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                                {getInitials(
                                                    booking.user?.fullname ||
                                                        booking.user
                                                            ?.username ||
                                                        "U"
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {booking.user?.fullname ||
                                                    booking.user?.username ||
                                                    "N/A"}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                {booking.user?.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {booking.user.email}
                                                    </span>
                                                )}
                                            </div>
                                            {booking.user?.phone && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {booking.user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Court Info */}
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {booking.court?.name || "N/A"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.court?.type_name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {booking.court?.venue_name}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Date & Time */}
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {format(
                                                new Date(booking.date),
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.start_time} -{" "}
                                            {booking.end_time}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            #
                                            {booking.booking_id
                                                .toString()
                                                .padStart(4, "0")}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Total Amount */}
                                <TableCell>
                                    <div className="font-medium text-gray-900">
                                        {formatCurrency(booking.total_amount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {booking.court?.hourly_rate &&
                                            formatCurrency(
                                                booking.court.hourly_rate
                                            )}{" "}
                                        / giờ
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <BookingStatusBadge
                                        status={booking.status}
                                        paymentStatus={booking.payment_status}
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
                                                    onView(booking.booking_id)
                                                }
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    onEdit(booking.booking_id)
                                                }
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            {/* Status Updates */}
                                            {booking.status === "pending" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            booking.booking_id,
                                                            "confirmed"
                                                        )
                                                    }
                                                    className="text-green-600"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Xác nhận
                                                </DropdownMenuItem>
                                            )}

                                            {booking.status === "confirmed" && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            booking.booking_id,
                                                            "completed"
                                                        )
                                                    }
                                                    className="text-blue-600"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Hoàn thành
                                                </DropdownMenuItem>
                                            )}

                                            {["pending", "confirmed"].includes(
                                                booking.status
                                            ) && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onUpdateStatus(
                                                            booking.booking_id,
                                                            "cancelled"
                                                        )
                                                    }
                                                    className="text-red-600"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Hủy đặt sân
                                                </DropdownMenuItem>
                                            )}

                                            {/* Payment Status Updates */}
                                            {booking.payment_status ===
                                                "pending" &&
                                                booking.status !==
                                                    "cancelled" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onUpdatePaymentStatus(
                                                                    booking.booking_id,
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

                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        booking.booking_id
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
                            Xác nhận xóa đặt sân
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa đặt sân này? Hành động này
                            không thể hoàn tác.
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
