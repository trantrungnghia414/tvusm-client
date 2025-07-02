// client/src/app/(admin)/dashboard/schedule/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    Building2,
    Plus,
    Filter,
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    format,
    addWeeks,
    subWeeks,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
} from "date-fns";
import { vi } from "date-fns/locale";
import { fetchApi } from "@/lib/api";
import DashboardLayout from "@/app/(admin)/dashboard/components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

interface ScheduleBooking {
    booking_id: number;
    court_id: number;
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    date: string;
    start_time: string;
    end_time: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    payment_status: "pending" | "paid" | "refunded";
    total_amount: number;
    notes?: string;
    user?: {
        user_id: number;
        username: string;
        email: string;
        fullname?: string;
        phone?: string;
    };
}

interface Court {
    court_id: number;
    name: string;
    type_name: string;
    venue_name: string;
    hourly_rate: number;
    status: string;
}

export default function SchedulePage() {
    const router = useRouter();

    // States
    const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [selectedCourt, setSelectedCourt] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [fetchingSchedule, setFetchingSchedule] = useState(false);

    // Time slots from 6:00 to 22:00 (every hour)
    const timeSlots = React.useMemo(() => {
        const slots = [];
        for (let hour = 6; hour <= 21; hour++) {
            slots.push({
                start_time: `${hour.toString().padStart(2, "0")}:00`,
                end_time: `${(hour + 1).toString().padStart(2, "0")}:00`,
            });
        }
        return slots;
    }, []);

    // Get week dates
    const weekDates = React.useMemo(() => {
        const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentWeek]);

    // Fetch courts
    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi("/courts", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCourts(
                        data.filter(
                            (court: Court) => court.status === "available"
                        )
                    );

                    // Auto select first court
                    if (data.length > 0) {
                        setSelectedCourt(data[0].court_id.toString());
                    }
                } else {
                    throw new Error("Không thể tải danh sách sân");
                }
            } catch (error) {
                console.error("Error fetching courts:", error);
                toast.error("Không thể tải danh sách sân");
            } finally {
                setLoading(false);
            }
        };

        fetchCourts();
    }, [router]);

    // Fetch schedule when court or week changes
    useEffect(() => {
        if (selectedCourt && currentWeek) {
            fetchSchedule();
        }
    }, [selectedCourt, currentWeek]);

    const fetchSchedule = async () => {
        if (!selectedCourt || !currentWeek) return;

        try {
            setFetchingSchedule(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const startDate = format(
                startOfWeek(currentWeek, { weekStartsOn: 1 }),
                "yyyy-MM-dd"
            );
            const endDate = format(
                endOfWeek(currentWeek, { weekStartsOn: 1 }),
                "yyyy-MM-dd"
            );

            const response = await fetchApi(
                `/bookings?court_id=${selectedCourt}&start_date=${startDate}&end_date=${endDate}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                const data = await response.json();

                // Transform data to match interface
                const transformedBookings: ScheduleBooking[] = data.map(
                    (booking: any) => ({
                        booking_id: booking.booking_id,
                        court_id: booking.court_id,
                        customer_name:
                            booking.user?.fullname ||
                            booking.user?.username ||
                            booking.customer_name ||
                            "Khách hàng",
                        customer_phone:
                            booking.user?.phone || booking.customer_phone,
                        customer_email:
                            booking.user?.email || booking.customer_email,
                        date: booking.date,
                        start_time: booking.start_time,
                        end_time: booking.end_time,
                        status: booking.status,
                        payment_status: booking.payment_status || "pending",
                        total_amount: booking.total_amount || 0,
                        notes: booking.notes,
                        user: booking.user,
                    })
                );

                setBookings(transformedBookings);
            } else {
                throw new Error("Không thể tải lịch đặt sân");
            }
        } catch (error) {
            console.error("Error fetching schedule:", error);
            toast.error("Không thể tải lịch đặt sân");
            setBookings([]);
        } finally {
            setFetchingSchedule(false);
        }
    };

    // Get booking for specific date and time slot
    const getBookingForTimeSlot = (
        date: Date,
        timeSlot: { start_time: string; end_time: string }
    ) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return bookings.find((booking) => {
            if (booking.date !== dateStr) return false;

            // Check if time slot overlaps with booking
            const bookingStart = booking.start_time;
            const bookingEnd = booking.end_time;
            const slotStart = timeSlot.start_time;
            const slotEnd = timeSlot.end_time;

            return (
                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
        });
    };

    // Check if slot is start of booking
    const isBookingStart = (
        booking: ScheduleBooking | undefined,
        timeSlot: { start_time: string; end_time: string }
    ) => {
        return booking && booking.start_time === timeSlot.start_time;
    };

    // Get slot background color based on booking status
    const getSlotColor = (booking: ScheduleBooking | undefined) => {
        if (!booking) {
            // ✅ Trống - xanh lá nhạt
            return "bg-green-50 border-green-200 text-green-700 hover:bg-green-100";
        }

        switch (booking.status) {
            case "pending":
                // ✅ Chờ xác nhận - vàng
                return "bg-yellow-100 border-yellow-300 text-yellow-800";
            case "confirmed":
                // ✅ Đã xác nhận - xanh dương
                return "bg-blue-100 border-blue-300 text-blue-800";
            case "completed":
                // ✅ Hoàn thành - xanh lá đậm
                return "bg-green-100 border-green-300 text-green-800";
            case "cancelled":
                // ✅ Đã hủy - đỏ
                return "bg-red-100 border-red-300 text-red-800";
            default:
                return "bg-gray-100 border-gray-300 text-gray-700";
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ XN";
            case "confirmed":
                return "Đã XN";
            case "completed":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Handle booking click
    const handleBookingClick = (bookingId: number) => {
        router.push(`/dashboard/bookings/${bookingId}`);
    };

    // Handle add booking
    const handleAddBooking = () => {
        router.push("/dashboard/bookings/add");
    };

    // Week navigation
    const goToPreviousWeek = () => {
        setCurrentWeek(subWeeks(currentWeek, 1));
    };

    const goToNextWeek = () => {
        setCurrentWeek(addWeeks(currentWeek, 1));
    };

    const goToCurrentWeek = () => {
        setCurrentWeek(new Date());
    };

    // Get selected court info
    const selectedCourtInfo = courts.find(
        (court) => court.court_id.toString() === selectedCourt
    );

    if (loading) {
        return (
            <DashboardLayout activeTab="bookings">
                <LoadingSpinner message="Đang tải dữ liệu..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="bookings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Lịch đặt sân theo tuần
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Xem lịch đặt sân theo dạng thời khóa biểu
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleAddBooking}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm đặt sân
                    </Button>
                </div>

                {/* Controls */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <span className="font-medium text-gray-700">
                                    Bộ lọc
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Court Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Chọn sân thể thao
                                </label>
                                <Select
                                    value={selectedCourt}
                                    onValueChange={setSelectedCourt}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn sân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courts.map((court) => (
                                            <SelectItem
                                                key={court.court_id}
                                                value={court.court_id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {court.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {court.type_name} •{" "}
                                                        {court.venue_name}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Week Navigation */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Điều hướng tuần
                                </label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousWeek}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Tuần trước
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToCurrentWeek}
                                        className="flex-1 min-w-0"
                                    >
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        <span className="truncate">
                                            {format(weekDates[0], "dd/MM", {
                                                locale: vi,
                                            })}{" "}
                                            -{" "}
                                            {format(
                                                weekDates[6],
                                                "dd/MM/yyyy",
                                                { locale: vi }
                                            )}
                                        </span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToNextWeek}
                                    >
                                        Tuần sau
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Selected Court Info */}
                        {selectedCourtInfo && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <h3 className="font-semibold text-blue-900">
                                                {selectedCourtInfo.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                                <span>
                                                    {
                                                        selectedCourtInfo.type_name
                                                    }
                                                </span>
                                                <span>•</span>
                                                <MapPin className="h-3 w-3" />
                                                <span>
                                                    {
                                                        selectedCourtInfo.venue_name
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-blue-900">
                                            {formatCurrency(
                                                selectedCourtInfo.hourly_rate
                                            )}
                                            /giờ
                                        </div>
                                        <div className="text-sm text-blue-700">
                                            Giá thuê sân
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Schedule Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Thời khóa biểu tuần
                            {fetchingSchedule && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-[900px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-8 bg-gray-50 border-b-2 border-gray-200">
                                    <div className="p-3 border-r border-gray-200 font-semibold text-gray-700 text-center">
                                        Giờ
                                    </div>
                                    {weekDates.map((date) => (
                                        <div
                                            key={date.toISOString()}
                                            className="p-3 border-r border-gray-200 text-center"
                                        >
                                            <div className="font-semibold text-gray-900">
                                                {format(date, "EEEE", {
                                                    locale: vi,
                                                })}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {format(date, "dd/MM", {
                                                    locale: vi,
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Time Rows */}
                                {timeSlots.map((timeSlot) => (
                                    <div
                                        key={timeSlot.start_time}
                                        className="grid grid-cols-8 border-b border-gray-100"
                                    >
                                        {/* Time Column */}
                                        <div className="p-3 border-r border-gray-200 bg-gray-50 text-center font-medium text-gray-700">
                                            <div className="text-sm">
                                                {timeSlot.start_time}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {timeSlot.end_time}
                                            </div>
                                        </div>

                                        {/* Day Columns */}
                                        {weekDates.map((date) => {
                                            const booking =
                                                getBookingForTimeSlot(
                                                    date,
                                                    timeSlot
                                                );
                                            const isStart = isBookingStart(
                                                booking,
                                                timeSlot
                                            );
                                            const slotColor =
                                                getSlotColor(booking);

                                            return (
                                                <div
                                                    key={`${date.toISOString()}-${
                                                        timeSlot.start_time
                                                    }`}
                                                    className="border-r border-gray-200 min-h-[60px]"
                                                >
                                                    {booking && isStart ? (
                                                        // ✅ Booking card
                                                        <div
                                                            onClick={() =>
                                                                handleBookingClick(
                                                                    booking.booking_id
                                                                )
                                                            }
                                                            className={`h-full p-2 cursor-pointer hover:shadow-md transition-all border-l-4 ${slotColor}`}
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-xs truncate">
                                                                    {
                                                                        booking.customer_name
                                                                    }
                                                                </div>
                                                                <div className="text-xs flex items-center gap-1">
                                                                    <Clock className="h-2 w-2" />
                                                                    <span>
                                                                        {
                                                                            booking.start_time
                                                                        }
                                                                        -
                                                                        {
                                                                            booking.end_time
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <Badge
                                                                        className={`text-xs px-1 py-0 ${slotColor}`}
                                                                        variant="secondary"
                                                                    >
                                                                        {getStatusText(
                                                                            booking.status
                                                                        )}
                                                                    </Badge>
                                                                    <span className="text-xs font-semibold">
                                                                        {formatCurrency(
                                                                            booking.total_amount
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {booking.customer_phone && (
                                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <Phone className="h-2 w-2" />
                                                                        <span className="truncate">
                                                                            {
                                                                                booking.customer_phone
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : booking ? (
                                                        // ✅ Continuation of booking
                                                        <div
                                                            className={`h-full border-l-4 ${slotColor} flex items-center justify-center`}
                                                        >
                                                            <span className="text-xs opacity-70">
                                                                ↕
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        // ✅ Available slot
                                                        <div
                                                            className={`h-full border-2 border-dashed cursor-pointer ${slotColor} flex items-center justify-center hover:shadow-sm transition-all`}
                                                        >
                                                            <span className="text-xs opacity-50">
                                                                Trống
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">
                            Tổng kết tuần{" "}
                            {format(weekDates[0], "dd/MM", { locale: vi })} -{" "}
                            {format(weekDates[6], "dd/MM/yyyy", { locale: vi })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {bookings.length}
                                </div>
                                <div className="text-blue-700">
                                    Tổng booking
                                </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {
                                        bookings.filter(
                                            (b) => b.status === "confirmed"
                                        ).length
                                    }
                                </div>
                                <div className="text-green-700">
                                    Đã xác nhận
                                </div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {
                                        bookings.filter(
                                            (b) => b.status === "pending"
                                        ).length
                                    }
                                </div>
                                <div className="text-yellow-700">
                                    Chờ xác nhận
                                </div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(
                                        bookings.reduce(
                                            (sum, b) => sum + b.total_amount,
                                            0
                                        )
                                    )}
                                </div>
                                <div className="text-purple-700">
                                    Doanh thu tuần
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">
                            Chú thích màu sắc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-200"></div>
                                <span>Trống</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                                <span>Chờ xác nhận</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                                <span>Đã xác nhận</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                                <span>Hoàn thành</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                                <span>Đã hủy</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
