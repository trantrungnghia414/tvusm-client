// client/src/app/(admin)/dashboard/bookings/components/BookingTable.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
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
    MapPin,
    Calendar,
    User,
    Building,
    Hash,
    Timer,
    ChevronLeft,
    ChevronRight,
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
        status: "unpaid" | "partial" | "paid" | "refunded"
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalPages = Math.ceil(bookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = useMemo(() => {
        return bookings.slice(startIndex, endIndex);
    }, [bookings, startIndex, endIndex]);

    // Reset to first page when bookings change
    useEffect(() => {
        setCurrentPage(1);
    }, [bookings.length]);

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

    // Helper function to calculate duration
    const calculateDuration = (startTime: string, endTime: string) => {
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return diffHours;
    };

    // Helper function to get priority badge based on booking status and date
    const getPriorityBadge = (booking: Booking) => {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const diffDays = Math.ceil(
            (bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (booking.status === "pending" && diffDays <= 1) {
            return (
                <Badge variant="destructive" className="text-xs">
                    Khẩn cấp
                </Badge>
            );
        }
        if (booking.status === "pending" && diffDays <= 3) {
            return (
                <Badge
                    variant="secondary"
                    className="text-xs bg-orange-100 text-orange-800"
                >
                    Ưu tiên
                </Badge>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Mã</TableHead>
                            <TableHead className="min-w-[200px]">
                                Thông tin khách hàng
                            </TableHead>
                            <TableHead className="min-w-[180px]">
                                Thông tin sân
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                                Thời gian đặt
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Chi phí
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Trạng thái
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                                Ngày đặt
                            </TableHead>
                            <TableHead className="w-[50px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </TableCell>
                                <TableCell>
                                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
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
                            <TableHead className="w-[60px]">Mã</TableHead>
                            <TableHead className="min-w-[200px]">
                                Thông tin khách hàng
                            </TableHead>
                            <TableHead className="min-w-[180px]">
                                Thông tin sân
                            </TableHead>
                            <TableHead className="min-w-[150px]">
                                Thời gian đặt
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Chi phí
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Trạng thái
                            </TableHead>
                            <TableHead className="min-w-[100px]">
                                Ngày đặt
                            </TableHead>
                            <TableHead className="w-[50px]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={8}
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
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[60px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <Hash className="h-3 w-3" />
                                    Mã
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[200px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Thông tin khách hàng
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[180px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    Thông tin sân
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[150px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Thời gian đặt
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[120px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Chi phí
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[120px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Trạng thái
                                </div>
                            </TableHead>
                            <TableHead className="min-w-[100px] font-semibold">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Ngày đặt
                                </div>
                            </TableHead>
                            <TableHead className="w-[50px] font-semibold text-center">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentBookings.map((booking) => {
                            const duration = calculateDuration(
                                booking.start_time,
                                booking.end_time
                            );
                            const priorityBadge = getPriorityBadge(booking);

                            return (
                                <TableRow
                                    key={booking.booking_id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {/* Booking ID */}
                                    <TableCell>
                                        <div className="font-mono text-sm font-semibold text-blue-600">
                                            #
                                            {booking.booking_id
                                                .toString()
                                                .padStart(4, "0")}
                                        </div>
                                        {priorityBadge}
                                    </TableCell>

                                    {/* Customer Info */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-semibold text-gray-900 truncate">
                                                {booking.user?.fullname ||
                                                    booking.user?.full_name ||
                                                    booking.user?.name ||
                                                    booking.user?.username ||
                                                    booking.customer_name ||
                                                    booking.renter_name ||
                                                    "N/A"}
                                            </div>
                                            {(booking.user?.email ||
                                                booking.customer_email ||
                                                booking.renter_email) && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {booking.user?.email ||
                                                            booking.customer_email ||
                                                            booking.renter_email}
                                                    </span>
                                                </div>
                                            )}
                                            {(booking.user?.phone ||
                                                booking.customer_phone ||
                                                booking.renter_phone) && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                    <span>
                                                        {booking.user?.phone ||
                                                            booking.customer_phone ||
                                                            booking.renter_phone}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Court Info */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-semibold text-gray-900">
                                                {booking.court?.name || "N/A"}
                                            </div>
                                            {booking.court?.type_name && (
                                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                                                    {booking.court.type_name}
                                                </div>
                                            )}
                                            {booking.court?.venue_name && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {
                                                            booking.court
                                                                .venue_name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Date & Time */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-semibold text-gray-900 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(
                                                    new Date(booking.date),
                                                    "dd/MM/yyyy",
                                                    { locale: vi }
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-center gap-1">
                                                <Timer className="h-3 w-3" />
                                                {booking.start_time} -{" "}
                                                {booking.end_time}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Thời lượng: {duration}h
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Cost */}
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-bold text-gray-900 text-lg">
                                                {formatCurrency(
                                                    booking.total_amount
                                                )}
                                            </div>
                                            {booking.court?.hourly_rate && (
                                                <div className="text-xs text-gray-500">
                                                    {formatCurrency(
                                                        booking.court
                                                            .hourly_rate
                                                    )}
                                                    /giờ
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <div className="space-y-2">
                                            <BookingStatusBadge
                                                status={booking.status}
                                                size="sm"
                                            />
                                            {/* Hiển thị payment status */}
                                            {booking.payment_status && (
                                                <div className="text-xs">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            booking.payment_status ===
                                                            "paid"
                                                                ? "bg-green-100 text-green-800"
                                                                : booking.payment_status ===
                                                                  "unpaid"
                                                                ? "bg-red-100 text-red-800"
                                                                : booking.payment_status ===
                                                                  "partial"
                                                                ? "bg-orange-100 text-orange-800"
                                                                : booking.payment_status ===
                                                                  "refunded"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {booking.payment_status ===
                                                        "paid"
                                                            ? "Đã thanh toán"
                                                            : booking.payment_status ===
                                                              "unpaid"
                                                            ? "Chưa thanh toán"
                                                            : booking.payment_status ===
                                                              "partial"
                                                            ? "Thanh toán thất bại"
                                                            : booking.payment_status ===
                                                              "refunded"
                                                            ? "Đã hoàn tiền"
                                                            : "Chờ xử lý"}
                                                    </span>
                                                </div>
                                            )}
                                            {booking.notes && (
                                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded max-w-[100px] truncate">
                                                    {booking.notes}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Created Date */}
                                    <TableCell>
                                        <div className="text-sm text-gray-600">
                                            {format(
                                                new Date(booking.created_at),
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(
                                                new Date(booking.created_at),
                                                "HH:mm",
                                                { locale: vi }
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-gray-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-56"
                                            >
                                                <DropdownMenuLabel>
                                                    Thao tác
                                                </DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onView(
                                                            booking.booking_id
                                                        )
                                                    }
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        onEdit(
                                                            booking.booking_id
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>
                                                    Cập nhật trạng thái
                                                </DropdownMenuLabel>

                                                {booking.status ===
                                                    "pending" && (
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
                                                        Xác nhận đặt sân
                                                    </DropdownMenuItem>
                                                )}

                                                {booking.status ===
                                                    "confirmed" && (
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

                                                {[
                                                    "pending",
                                                    "confirmed",
                                                ].includes(booking.status) && (
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

                                                {booking.payment_status ===
                                                    "unpaid" &&
                                                    booking.status !==
                                                        "cancelled" && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>
                                                                Thanh toán
                                                            </DropdownMenuLabel>
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
                                                                Đánh dấu đã
                                                                thanh toán
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
                                                    Xóa đặt sân
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {bookings.length > itemsPerPage && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-700">
                        Hiển thị {startIndex + 1} đến{" "}
                        {Math.min(endIndex, bookings.length)} trong tổng số{" "}
                        {bookings.length} kết quả
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Trước
                        </Button>

                        <div className="flex items-center space-x-1">
                            {Array.from(
                                { length: Math.min(5, totalPages) },
                                (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={
                                                currentPage === pageNumber
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setCurrentPage(pageNumber)
                                            }
                                            className="min-w-[32px]"
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                }
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

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
                            không thể hoàn tác và sẽ ảnh hưởng đến dữ liệu liên
                            quan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa đặt sân
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
