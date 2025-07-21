// client/src/app/(admin)/dashboard/schedule/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    DialogFooter,
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
    Plus,
    DollarSign,
    CheckCircle2,
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

// ✅ Interface cho Quick Booking
interface QuickBookingSlot {
    date: string;
    start_time: string;
    end_time: string;
}

interface QuickBookingForm {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    notes: string;
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

    // ✅ Quick Booking States
    const [quickBookingOpen, setQuickBookingOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<QuickBookingSlot | null>(
        null
    );
    const [creatingBooking, setCreatingBooking] = useState(false);
    const [bookingForm, setBookingForm] = useState<QuickBookingForm>({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        notes: "",
    });

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

    // ✅ Handle slot click for booking
    const handleSlotClick = (
        date: Date,
        timeSlot: { start_time: string; end_time: string }
    ) => {
        const booking = getBookingForTimeSlot(date, timeSlot);

        if (booking) {
            // If slot has booking, view booking details
            router.push(`/dashboard/bookings/${booking.booking_id}`);
        } else {
            // If slot is empty, open quick booking dialog
            const dateStr = format(date, "yyyy-MM-dd");
            setSelectedSlot({
                date: dateStr,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
            });
            setQuickBookingOpen(true);
        }
    };

    // ✅ Handle quick booking creation
    const handleQuickBooking = async () => {
        if (!selectedSlot || !selectedCourt) return;

        // ✅ Enhanced Validation
        if (!bookingForm.customer_name.trim()) {
            toast.error("Vui lòng nhập tên khách hàng");
            return;
        }

        if (!bookingForm.customer_phone.trim()) {
            toast.error("Vui lòng nhập số điện thoại");
            return;
        }

        // ✅ Validate phone number
        if (!/^0\d{9}$/.test(bookingForm.customer_phone.trim())) {
            toast.error(
                "Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng số 0)"
            );
            return;
        }

        // ✅ Validate email if provided, or use default
        let email = bookingForm.customer_email.trim();
        if (!email) {
            email = "guest@example.com"; // Default email
        } else {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                toast.error("Vui lòng nhập email hợp lệ");
                return;
            }
        }

        try {
            setCreatingBooking(true);
            const token = localStorage.getItem("token");

            // ✅ Booking data for both authenticated and guest users
            const bookingData = {
                court_id: parseInt(selectedCourt),
                date: selectedSlot.date,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
                renter_name: bookingForm.customer_name.trim(),
                renter_phone: bookingForm.customer_phone.trim(),
                renter_email: email,
                notes: bookingForm.notes.trim() || "",
                payment_method: "cash",
            };

            console.log("Sending booking data:", bookingData);

            // ✅ Request headers (with or without token)
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetchApi("/bookings", {
                method: "POST",
                headers,
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Booking error:", errorData);

                // ✅ Better error handling
                if (errorData.message && Array.isArray(errorData.message)) {
                    toast.error(errorData.message.join(", "));
                } else {
                    toast.error(errorData.message || "Không thể tạo đặt sân");
                }
                return;
            }

            const responseData = await response.json();
            console.log("Booking success:", responseData);

            toast.success("Đặt sân thành công!");

            // Reset form
            setBookingForm({
                customer_name: "",
                customer_phone: "",
                customer_email: "",
                notes: "",
            });

            // Close dialog
            setQuickBookingOpen(false);
            setSelectedSlot(null);

            // Refresh schedule
            await fetchSchedule();
        } catch (error) {
            console.error("Error creating booking:", error);
            toast.error(
                error instanceof Error ? error.message : "Không thể tạo đặt sân"
            );
        } finally {
            setCreatingBooking(false);
        }
    };

    const handleBookingClick = (bookingId: number) => {
        router.push(`/dashboard/bookings/${bookingId}`);
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
                            <p className="text-sm text-gray-600 mt-1">
                                Click vào khung giờ trống để đặt sân mới cho
                                khách hàng
                            </p>
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
                                        <span>Trống (Click để đặt)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
                                        <span>Chờ xác nhận</span>
                                    </div>
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
                                                            // ✅ Booking card - Click to view details
                                                            <div
                                                                onClick={() =>
                                                                    handleBookingClick(
                                                                        booking.booking_id
                                                                    )
                                                                }
                                                                className={`h-full p-2 cursor-pointer hover:shadow-md transition-all border-l-4 ${slotColor}`}
                                                                title="Click để xem chi tiết đặt sân"
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
                                                            // ✅ Available slot - Click to book
                                                            <div
                                                                onClick={() =>
                                                                    handleSlotClick(
                                                                        date,
                                                                        timeSlot
                                                                    )
                                                                }
                                                                className={`h-full border-2 border-dashed cursor-pointer ${slotColor} flex items-center justify-center hover:shadow-sm transition-all group`}
                                                                title="Click để đặt sân cho khách hàng"
                                                            >
                                                                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                                    <Plus className="h-3 w-3" />
                                                                    <span className="text-xs">
                                                                        Đặt sân
                                                                    </span>
                                                                </div>
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

                {/* Summary */}
                {selectedCourt && bookings.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Tổng kết tuần{" "}
                                {format(weekDates[0], "dd/MM", { locale: vi })}{" "}
                                -{" "}
                                {format(weekDates[6], "dd/MM/yyyy", {
                                    locale: vi,
                                })}
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
                                                (sum, b) =>
                                                    sum + b.total_amount,
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
                )}

                {/* ✅ Quick Booking Dialog */}
                <Dialog
                    open={quickBookingOpen}
                    onOpenChange={setQuickBookingOpen}
                >
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Đặt sân cho khách hàng
                            </DialogTitle>
                            <DialogDescription>
                                Nhập thông tin khách hàng để tạo đặt sân mới
                            </DialogDescription>
                        </DialogHeader>

                        {selectedSlot && selectedCourtInfo && (
                            <div className="space-y-6">
                                {/* Booking Details */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        Thông tin đặt sân
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-blue-600" />
                                            <span className="text-blue-800">
                                                {selectedCourtInfo.name} -{" "}
                                                {selectedCourtInfo.venue_name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                                            <span className="text-blue-800">
                                                {format(
                                                    new Date(selectedSlot.date),
                                                    "EEEE, dd/MM/yyyy",
                                                    { locale: vi }
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-blue-800">
                                                {selectedSlot.start_time} -{" "}
                                                {selectedSlot.end_time}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-blue-600" />
                                            <span className="font-bold text-blue-900">
                                                {formatCurrency(
                                                    selectedCourtInfo.hourly_rate
                                                )}{" "}
                                                (Thanh toán tiền mặt)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Form */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer_name">
                                            Tên khách hàng{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="customer_name"
                                            placeholder="Nhập tên khách hàng"
                                            value={bookingForm.customer_name}
                                            onChange={(e) =>
                                                setBookingForm({
                                                    ...bookingForm,
                                                    customer_name:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_phone">
                                            Số điện thoại{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="customer_phone"
                                            placeholder="Nhập số điện thoại (VD: 0123456789)"
                                            value={bookingForm.customer_phone}
                                            onChange={(e) =>
                                                setBookingForm({
                                                    ...bookingForm,
                                                    customer_phone:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="customer_email">
                                            Email (tùy chọn)
                                        </Label>
                                        <Input
                                            id="customer_email"
                                            type="email"
                                            placeholder="Nhập email khách hàng"
                                            value={bookingForm.customer_email}
                                            onChange={(e) =>
                                                setBookingForm({
                                                    ...bookingForm,
                                                    customer_email:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Ghi chú (tùy chọn)
                                        </Label>
                                        <Input
                                            id="notes"
                                            placeholder="Ghi chú thêm về đặt sân"
                                            value={bookingForm.notes}
                                            onChange={(e) =>
                                                setBookingForm({
                                                    ...bookingForm,
                                                    notes: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setQuickBookingOpen(false);
                                    setBookingForm({
                                        customer_name: "",
                                        customer_phone: "",
                                        customer_email: "",
                                        notes: "",
                                    });
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleQuickBooking}
                                disabled={creatingBooking}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {creatingBooking ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Tạo đặt sân
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
