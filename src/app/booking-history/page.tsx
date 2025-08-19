"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    MapPin,
    Eye,
    ArrowLeft,
    Search,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Booking {
    booking_id: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    notes?: string;
    created_at: string;
    updated_at: string;

    // Relations
    court?: {
        court_id: number;
        name: string;
        courtType: {
            name: string;
        };
        venue: {
            name: string;
            location: string;
        };
    };
    payment?: {
        payment_id: number;
        amount: number;
        payment_method: string;
        status: string;
        paid_at?: string;
    };
}

interface BookingFilters {
    status: string;
    dateFrom: string;
    dateTo: string;
    search: string;
}

export default function BookingHistoryPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null
    );
    const [filters, setFilters] = useState<BookingFilters>({
        status: "all",
        dateFrom: "",
        dateTo: "",
        search: "",
    });

    const fetchBookingHistory = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/bookings/my-bookings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }
                throw new Error("Không thể tải lịch sử đặt sân");
            }

            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error("Error fetching booking history:", error);
            toast.error("Không thể tải lịch sử đặt sân");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchBookingHistory();
    }, [fetchBookingHistory]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                    >
                        Chờ xác nhận
                    </Badge>
                );
            case "confirmed":
                return (
                    <Badge
                        variant="outline"
                        className="text-blue-600 border-blue-600"
                    >
                        Đã xác nhận
                    </Badge>
                );
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                    >
                        Hoàn thành
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="text-red-600 border-red-600"
                    >
                        Đã hủy
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                    >
                        Đã thanh toán
                    </Badge>
                );
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600"
                    >
                        Chờ thanh toán
                    </Badge>
                );
            case "failed":
                return (
                    <Badge
                        variant="outline"
                        className="text-red-600 border-red-600"
                    >
                        Thất bại
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesStatus =
            filters.status === "all" || booking.status === filters.status;
        const matchesSearch =
            booking.court?.name
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
            booking.court?.venue.name
                .toLowerCase()
                .includes(filters.search.toLowerCase());

        let matchesDate = true;
        if (filters.dateFrom) {
            matchesDate =
                matchesDate &&
                new Date(booking.date) >= new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            matchesDate =
                matchesDate &&
                new Date(booking.date) <= new Date(filters.dateTo);
        }

        return matchesStatus && matchesSearch && matchesDate;
    });

    if (loading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải lịch sử đặt sân...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Lịch sử đặt sân</h1>
                    <p className="text-gray-600">
                        Quản lý và theo dõi các lần đặt sân của bạn
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tên sân hoặc địa điểm..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                        })
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Trạng thái
                            </label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="pending">
                                        Chờ xác nhận
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                        Đã xác nhận
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Hoàn thành
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Đã hủy
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Từ ngày
                            </label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        dateFrom: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Đến ngày
                            </label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        dateTo: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Booking List */}
            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không có lịch sử đặt sân
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Bạn chưa có lần đặt sân nào hoặc không tìm thấy
                                kết quả phù hợp với bộ lọc.
                            </p>
                            <Button onClick={() => router.push("/")}>
                                Đặt sân ngay
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map((booking) => (
                        <Card
                            key={booking.booking_id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <CardContent className="py-1 px-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold">
                                                {booking.court?.name}
                                            </h3>
                                            {getStatusBadge(booking.status)}
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    {booking.court?.venue.name}{" "}
                                                    -{" "}
                                                    {
                                                        booking.court?.venue
                                                            .location
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {formatDate(booking.date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {formatTime(
                                                        booking.start_time
                                                    )}{" "}
                                                    -{" "}
                                                    {formatTime(
                                                        booking.end_time
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary mb-2">
                                            {formatCurrency(
                                                booking.total_amount
                                            )}
                                        </div>
                                        {booking.payment && (
                                            <div className="mb-2">
                                                {getPaymentStatusBadge(
                                                    booking.payment.status
                                                )}
                                            </div>
                                        )}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedBooking(
                                                            booking
                                                        )
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Chi tiết
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Chi tiết đặt sân
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Thông tin chi tiết về
                                                        lần đặt sân #
                                                        {booking.booking_id}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                {selectedBooking && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="font-medium mb-2">
                                                                Thông tin sân
                                                            </h4>
                                                            <div className="text-sm space-y-1">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Tên sân:
                                                                    </span>{" "}
                                                                    {
                                                                        selectedBooking
                                                                            .court
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Loại
                                                                        sân:
                                                                    </span>{" "}
                                                                    {
                                                                        selectedBooking
                                                                            .court
                                                                            ?.courtType
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Địa
                                                                        điểm:
                                                                    </span>{" "}
                                                                    {
                                                                        selectedBooking
                                                                            .court
                                                                            ?.venue
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Địa chỉ:
                                                                    </span>{" "}
                                                                    {
                                                                        selectedBooking
                                                                            .court
                                                                            ?.venue
                                                                            .location
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-2">
                                                                Thời gian
                                                            </h4>
                                                            <div className="text-sm space-y-1">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Ngày:
                                                                    </span>{" "}
                                                                    {formatDate(
                                                                        selectedBooking.date
                                                                    )}
                                                                </p>
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Giờ:
                                                                    </span>{" "}
                                                                    {formatTime(
                                                                        selectedBooking.start_time
                                                                    )}{" "}
                                                                    -{" "}
                                                                    {formatTime(
                                                                        selectedBooking.end_time
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-2">
                                                                Thanh toán
                                                            </h4>
                                                            <div className="text-sm space-y-1">
                                                                <p>
                                                                    <span className="font-medium">
                                                                        Tổng
                                                                        tiền:
                                                                    </span>{" "}
                                                                    {formatCurrency(
                                                                        selectedBooking.total_amount
                                                                    )}
                                                                </p>
                                                                {selectedBooking.payment && (
                                                                    <>
                                                                        <p>
                                                                            <span className="font-medium">
                                                                                Phương
                                                                                thức:
                                                                            </span>{" "}
                                                                            {
                                                                                selectedBooking
                                                                                    .payment
                                                                                    .payment_method
                                                                            }
                                                                        </p>
                                                                        <p>
                                                                            <span className="font-medium">
                                                                                Trạng
                                                                                thái:
                                                                            </span>
                                                                            <span className="ml-2">
                                                                                {getPaymentStatusBadge(
                                                                                    selectedBooking
                                                                                        .payment
                                                                                        .status
                                                                                )}
                                                                            </span>
                                                                        </p>
                                                                        {selectedBooking
                                                                            .payment
                                                                            .paid_at && (
                                                                            <p>
                                                                                <span className="font-medium">
                                                                                    Thời
                                                                                    gian
                                                                                    TT:
                                                                                </span>{" "}
                                                                                {formatDate(
                                                                                    selectedBooking
                                                                                        .payment
                                                                                        .paid_at
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-2">
                                                                Trạng thái đặt
                                                                sân
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusBadge(
                                                                    selectedBooking.status
                                                                )}
                                                            </div>
                                                        </div>

                                                        {selectedBooking.notes && (
                                                            <div>
                                                                <h4 className="font-medium mb-2">
                                                                    Ghi chú
                                                                </h4>
                                                                <p className="text-sm text-gray-600">
                                                                    {
                                                                        selectedBooking.notes
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h4 className="font-medium mb-2">
                                                                Thời gian tạo
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                {formatDate(
                                                                    selectedBooking.created_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Summary */}
            {filteredBookings.length > 0 && (
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <div className="text-center text-sm text-gray-600">
                            Hiển thị {filteredBookings.length} lần đặt sân
                            {filters.status !== "all" &&
                                ` với trạng thái "${filters.status}"`}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
