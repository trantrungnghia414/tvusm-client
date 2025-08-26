// trang quản lý lịch đặt sân
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    Building2,
    Phone,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    CreditCard,
    FileText,
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
    type_id: number;
    type_name: string;
    venue_name: string;
    hourly_rate: number;
    status: string;
}

interface CourtType {
    type_id: number;
    name: string;
    description?: string;
}

// ✅ Sửa lỗi: Thêm interface cho raw booking data từ API
interface RawBookingData {
    booking_id: number;
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    payment_status?: string;
    total_amount?: number;
    notes?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    user?: {
        user_id: number;
        username: string;
        email: string;
        fullname?: string;
        phone?: string;
    };
}

export default function SchedulePage() {
    const router = useRouter();

    // States
    const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined
    );
    const [selectedCourtType, setSelectedCourtType] = useState<string>("");
    const [selectedCourt, setSelectedCourt] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [fetchingSchedule, setFetchingSchedule] = useState(false);
    const [selectedBooking, setSelectedBooking] =
        useState<ScheduleBooking | null>(null);
    const [showBookingDialog, setShowBookingDialog] = useState(false);

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

    // Filter courts by selected court type
    const filteredCourts = React.useMemo(() => {
        if (!selectedCourtType) return [];
        return courts.filter(
            (court) => court.type_id.toString() === selectedCourtType
        );
    }, [courts, selectedCourtType]);

    // ✅ Sử dụng useCallback cho fetchSchedule
    const fetchSchedule = useCallback(async () => {
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

                // ✅ Thay thế any bằng RawBookingData
                const transformedBookings: ScheduleBooking[] = data.map(
                    (booking: RawBookingData) => ({
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
                        status: booking.status as ScheduleBooking["status"],
                        payment_status: (booking.payment_status ||
                            "pending") as ScheduleBooking["payment_status"],
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
    }, [selectedCourt, currentWeek]);

    // Fetch court types and courts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Phiên đăng nhập hết hạn");
                    router.push("/login");
                    return;
                }

                // Fetch court types and courts in parallel
                const [courtTypesRes, courtsRes] = await Promise.all([
                    fetchApi("/court-types", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/courts", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (courtTypesRes.ok) {
                    const courtTypesData = await courtTypesRes.json();
                    setCourtTypes(courtTypesData);

                    // Auto select first court type
                    if (courtTypesData.length > 0) {
                        setSelectedCourtType(
                            courtTypesData[0].type_id.toString()
                        );
                    }
                }

                if (courtsRes.ok) {
                    const courtsData = await courtsRes.json();
                    setCourts(
                        courtsData.filter(
                            (court: Court) => court.status === "available"
                        )
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // Auto select first court when court type changes
    useEffect(() => {
        if (filteredCourts.length > 0 && selectedCourtType) {
            setSelectedCourt(filteredCourts[0].court_id.toString());
        } else {
            setSelectedCourt("");
        }
    }, [filteredCourts, selectedCourtType]);

    // Reset court selection when court type changes
    useEffect(() => {
        setSelectedCourt("");
    }, [selectedCourtType]);

    // Fetch schedule when dependencies change
    useEffect(() => {
        if (selectedCourt && currentWeek) {
            fetchSchedule();
        }
    }, [selectedCourt, currentWeek, fetchSchedule]);

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
                return "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200";
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

    // Handle slot click - show booking details or do nothing for empty slots
    const handleSlotClick = (booking: ScheduleBooking | undefined) => {
        if (booking) {
            // Có booking - hiển thị thông tin
            setSelectedBooking(booking);
            setShowBookingDialog(true);
        }
        // Nếu không có booking (slot trống) - không làm gì
    };

    // Get payment status text and color
    const getPaymentStatusText = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "pending":
                return "Chờ thanh toán";
            case "paid":
                return "Đã thanh toán";
            case "refunded":
                return "Đã hoàn tiền";
            default:
                return paymentStatus;
        }
    };

    const getPaymentStatusColor = (paymentStatus: string) => {
        switch (paymentStatus) {
            case "pending":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            case "paid":
                return "text-green-600 bg-green-50 border-green-200";
            case "refunded":
                return "text-gray-600 bg-gray-50 border-gray-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    // Navigate to booking detail page
    const handleViewBookingDetail = () => {
        if (selectedBooking) {
            router.push(`/dashboard/bookings/${selectedBooking.booking_id}`);
        }
    };

    // Week navigation
    const goToPreviousWeek = () => {
        setCurrentWeek(subWeeks(currentWeek, 1));
        setSelectedDate(undefined); // ✅ Reset selected date khi chuyển tuần
    };

    const goToNextWeek = () => {
        setCurrentWeek(addWeeks(currentWeek, 1));
        setSelectedDate(undefined); // ✅ Reset selected date khi chuyển tuần
    };

    // Handle date selection
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            setCurrentWeek(date); // Update current week when date is selected
        }
    };

    // Get selected court type info
    const selectedCourtTypeInfo = courtTypes.find(
        (type) => type.type_id.toString() === selectedCourtType
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
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <Card>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Court Type Selection */}
                            <div className="gap-2 flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Chọn loại sân
                                </label>
                                <Select
                                    value={selectedCourtType}
                                    onValueChange={setSelectedCourtType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại sân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courtTypes.map((type) => (
                                            <SelectItem
                                                key={type.type_id}
                                                value={type.type_id.toString()}
                                            >
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Court Selection */}
                            <div className="gap-2 flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Chọn sân thể thao
                                </label>
                                <Select
                                    value={selectedCourt}
                                    onValueChange={setSelectedCourt}
                                    disabled={
                                        !selectedCourtType ||
                                        filteredCourts.length === 0
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                !selectedCourtType
                                                    ? "Vui lòng chọn loại sân trước"
                                                    : filteredCourts.length ===
                                                      0
                                                    ? "Không có sân khả dụng"
                                                    : "Chọn sân"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCourts.map((court) => (
                                            <SelectItem
                                                key={court.court_id}
                                                value={court.court_id.toString()}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-start">
                                                        {court.name}
                                                    </span>
                                                    {/* <span className="text-sm text-gray-500">
                                                        {court.venue_name} •{" "}
                                                        {formatCurrency(
                                                            court.hourly_rate
                                                        )}
                                                        /giờ
                                                    </span> */}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCourtType &&
                                    filteredCourts.length === 0 && (
                                        <p className="text-xs text-amber-600">
                                            Không có sân nào thuộc loại &quot;
                                            {selectedCourtTypeInfo?.name}&quot;
                                        </p>
                                    )}
                            </div>

                            {/* Date & Week Navigation */}
                            <div className="gap-2 flex flex-col">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium text-gray-700">
                                        Chọn ngày
                                    </div>
                                    {/* Current Week Display */}
                                    <div className="text-xs text-gray-500 text-center">
                                        {format(weekDates[0], "dd/MM", {
                                            locale: vi,
                                        })}{" "}
                                        -{" "}
                                        {format(weekDates[6], "dd/MM/yyyy", {
                                            locale: vi,
                                        })}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Date Picker */}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex-1 justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? (
                                                    format(
                                                        selectedDate,
                                                        "dd/MM/yyyy",
                                                        { locale: vi }
                                                    )
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Chọn ngày
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={handleDateSelect}
                                                initialFocus
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    {/* Week Navigation Buttons */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToPreviousWeek}
                                        title="Tuần trước"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={goToNextWeek}
                                        title="Tuần sau"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule Table */}
                {selectedCourt ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Lịch sân trong tuần
                                    {fetchingSchedule && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-green-50 border-2 border-green-200"></div>
                                        <span>Trống</span>
                                    </div>
                                    {/* <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
                                        <span>Chờ xác nhận</span>
                                    </div> */}
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
                                        <span>Đã xác nhận</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                                        <span>Hoàn thành</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                                        <span>Đã hủy</span>
                                    </div>
                                </div>
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
                                                                    handleSlotClick(
                                                                        booking
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
                                                                onClick={() =>
                                                                    handleSlotClick(
                                                                        booking
                                                                    )
                                                                }
                                                                className={`h-full border-l-4 cursor-pointer hover:shadow-sm transition-all ${slotColor} flex items-center justify-center`}
                                                            >
                                                                <span className="text-xs opacity-70">
                                                                    Đã đặt
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            // ✅ Available slot - không có click handler
                                                            <div
                                                                className={`h-full border-2 border-dashed ${slotColor} flex items-center justify-center hover:shadow-sm transition-all`}
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
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Chưa chọn sân
                            </h3>
                            <p className="text-gray-600">
                                Vui lòng chọn loại sân và sân thể thao để xem
                                lịch đặt sân
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Booking Details Dialog */}
                <Dialog
                    open={showBookingDialog}
                    onOpenChange={setShowBookingDialog}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Chi tiết đặt sân
                            </DialogTitle>
                            <DialogDescription>
                                Thông tin chi tiết về lịch đặt sân
                            </DialogDescription>
                        </DialogHeader>

                        {selectedBooking && (
                            <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Thông tin khách hàng
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Họ tên:
                                            </span>
                                            <span className="font-medium">
                                                {selectedBooking.customer_name}
                                            </span>
                                        </div>
                                        {selectedBooking.customer_phone && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    Điện thoại:
                                                </span>
                                                <span className="font-medium">
                                                    {
                                                        selectedBooking.customer_phone
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {selectedBooking.customer_email && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    Email:
                                                </span>
                                                <span className="font-medium text-xs">
                                                    {
                                                        selectedBooking.customer_email
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Booking Info */}
                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Thông tin đặt sân
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Ngày:
                                            </span>
                                            <span className="font-medium">
                                                {format(
                                                    new Date(
                                                        selectedBooking.date
                                                    ),
                                                    "dd/MM/yyyy",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Giờ:
                                            </span>
                                            <span className="font-medium">
                                                {selectedBooking.start_time} -{" "}
                                                {selectedBooking.end_time}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Trạng thái:
                                            </span>
                                            <Badge
                                                className={`text-xs ${getSlotColor(
                                                    selectedBooking
                                                )}`}
                                                variant="secondary"
                                            >
                                                {getStatusText(
                                                    selectedBooking.status
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Thanh toán
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Tổng tiền:
                                            </span>
                                            <span className="font-bold text-green-600">
                                                {formatCurrency(
                                                    selectedBooking.total_amount
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Trạng thái:
                                            </span>
                                            <Badge
                                                className={`text-xs ${getPaymentStatusColor(
                                                    selectedBooking.payment_status
                                                )}`}
                                                variant="outline"
                                            >
                                                {getPaymentStatusText(
                                                    selectedBooking.payment_status
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {selectedBooking.notes && (
                                    <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                                        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Ghi chú
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                            {selectedBooking.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={handleViewBookingDetail}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Xem chi tiết
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            setShowBookingDialog(false)
                                        }
                                        variant="outline"
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
