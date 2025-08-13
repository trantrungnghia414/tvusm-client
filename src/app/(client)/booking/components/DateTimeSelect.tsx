"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { format, addDays, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";

interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
    booking_id?: number | null; // ✅ Thêm property này
    booking_status?: string | null; // ✅ Thêm thêm booking_status nếu cần
}

interface DayAvailability {
    date: string;
    slots: TimeSlot[];
}

export interface DateTimeValue {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
}

interface DateTimeSelectProps {
    value: DateTimeValue;
    onChange: (value: DateTimeValue) => void;
    courtId: number;
    onNext?: () => void; // ✅ Thêm prop onNext
}

export default function DateTimeSelect({
    value,
    onChange,
    courtId,
    onNext, // ✅ Destructure onNext prop
}: DateTimeSelectProps) {
    const [date, setDate] = useState<Date>(
        value.date ? parse(value.date, "yyyy-MM-dd", new Date()) : new Date()
    );
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate default time slots for fallback
    const generateDefaultTimeSlots = useCallback(() => {
        const slots: TimeSlot[] = [];
        const now = new Date();
        const currentHour = now.getHours();
        const isToday =
            date &&
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        // Opening hours
        const openingHour = 6; // 6:00 AM
        const closingHour = 22; // 10:00 PM

        for (let hour = openingHour; hour < closingHour; hour++) {
            // Skip past hours for today
            let available = true;
            if (isToday && hour <= currentHour) {
                available = false;
            }

            const start_time = `${hour.toString().padStart(2, "0")}:00`;
            const end_time = `${(hour + 1).toString().padStart(2, "0")}:00`;

            // Random availability for demo
            if (available) {
                available = Math.random() > 0.3; // 70% chance to be available
            }

            slots.push({
                start_time,
                end_time,
                is_available: available,
            });
        }

        return [{ date: format(date, "yyyy-MM-dd"), slots }];
    }, [date]);

    // Fetch available slots when date changes - exactly like CourtSchedule
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            setLoading(true);
            setError(null);
            setSelectedSlots([]); // Reset selected slots when date changes

            try {
                const formattedDate = format(date, "yyyy-MM-dd");
                const response = await fetchApi(
                    `/courts/${courtId}/availability?date=${formattedDate}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Không tìm thấy dữ liệu lịch đặt sân");
                    } else if (response.status === 500) {
                        throw new Error(
                            "Lỗi server khi tải dữ liệu lịch đặt sân"
                        );
                    } else {
                        throw new Error(
                            `Không thể tải dữ liệu lịch đặt sân (${response.status})`
                        );
                    }
                }

                const data = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        "Dữ liệu lịch đặt sân không đúng định dạng"
                    );
                }

                setAvailability(data);
            } catch (err) {
                console.error("Error fetching availability:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải thông tin khung giờ"
                );

                // Use default slots on error
                setAvailability(generateDefaultTimeSlots());
            } finally {
                setLoading(false);
            }
        };

        if (courtId) {
            fetchAvailableSlots();
        }
    }, [date, courtId, generateDefaultTimeSlots]);

    // Handle date change - exactly like CourtSchedule
    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);

            // Clear existing selections when date changes
            setSelectedSlots([]);
            onChange({
                date: format(newDate, "yyyy-MM-dd"),
                startTime: "",
                endTime: "",
                duration: value.duration,
            });
        }
    };

    // Handle slot selection - exactly like CourtSchedule
    const handleSlotToggle = (slot: TimeSlot) => {
        if (!slot.is_available) {
            return; // Cannot select unavailable slots
        }

        // Check if slot is already selected
        const isSlotSelected = selectedSlots.some(
            (s) =>
                s.start_time === slot.start_time && s.end_time === slot.end_time
        );

        let newSelectedSlots: TimeSlot[];

        if (isSlotSelected) {
            // Remove slot if already selected
            newSelectedSlots = selectedSlots.filter(
                (s) =>
                    !(
                        s.start_time === slot.start_time &&
                        s.end_time === slot.end_time
                    )
            );
        } else {
            // Add slot to selection
            newSelectedSlots = [...selectedSlots, slot];
        }

        setSelectedSlots(newSelectedSlots);

        // Update form values based on selected slots
        if (newSelectedSlots.length > 0) {
            // Sort slots by start time
            const sortedSlots = [...newSelectedSlots].sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
            );

            const startTime = sortedSlots[0].start_time;
            const endTime = sortedSlots[sortedSlots.length - 1].end_time;

            // ✅ SỬA: Tính duration dựa trên số slot đã chọn, không phải khoảng cách thời gian
            const duration = newSelectedSlots.length; // Mỗi slot = 1 giờ

            onChange({
                date: format(date, "yyyy-MM-dd"),
                startTime: startTime,
                endTime: endTime,
                duration: duration, // ✅ Đây là số giờ thực tế đã chọn
            });
        } else {
            // Clear selection
            onChange({
                date: format(date, "yyyy-MM-dd"),
                startTime: "",
                endTime: "",
                duration: 0, // ✅ Reset về 0 khi không chọn gì
            });
        }
    };

    // Retry function - exactly like CourtSchedule
    const handleRetry = () => {
        setError(null);
        const fetchData = async () => {
            try {
                setLoading(true);
                const formattedDate = format(date, "yyyy-MM-dd");
                const response = await fetchApi(
                    `/courts/${courtId}/availability?date=${formattedDate}`
                );
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setAvailability(data);
            } catch (err) {
                setError("Không thể tải dữ liệu lịch đặt sân");
                console.error("Error fetching availability:", err);

                // Use default slots on error
                setAvailability(generateDefaultTimeSlots());
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    // Find availability for selected date
    const selectedDayAvailability = availability.find(
        (day) => day.date === format(date, "yyyy-MM-dd")
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left side: Calendar display */}
                <div className="md:w-1/3">
                    <div>
                        {/* Calendar display */}
                        <div className="border border-gray-200 rounded-md p-3 bg-white">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                className="mx-auto"
                                locale={vi}
                                disabled={(date) =>
                                    date <
                                        new Date(
                                            new Date().setHours(0, 0, 0, 0)
                                        ) || date > addDays(new Date(), 30)
                                }
                            />
                        </div>
                    </div>

                    {/* ✅ Nút tiếp theo - sửa lại logic */}
                    <div className="mt-4">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={selectedSlots.length === 0}
                            onClick={() => {
                                console.log("Button clicked!", {
                                    selectedSlots: selectedSlots.length,
                                    hasOnNext: !!onNext,
                                    value: value,
                                }); // ✅ Debug log

                                if (selectedSlots.length > 0 && onNext) {
                                    console.log("Calling onNext..."); // ✅ Debug log
                                    onNext();
                                } else {
                                    console.log("Conditions not met:", {
                                        slotsSelected: selectedSlots.length > 0,
                                        onNextExists: !!onNext,
                                    }); // ✅ Debug log
                                }
                            }}
                        >
                            Tiếp theo
                        </Button>
                    </div>
                </div>

                {/* Right side: Time slots booking */}
                <div className="md:w-2/3">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
                            <span className="text-gray-600">
                                Đang tải lịch sân...
                            </span>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive" className="mb-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Lỗi</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                className="flex items-center gap-2 mt-2"
                                size="sm"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Thử lại
                            </Button>
                        </Alert>
                    ) : (
                        <>
                            {selectedDayAvailability &&
                            selectedDayAvailability.slots.length > 0 ? (
                                <div>
                                    <div className="mb-3 border-b pb-2 flex justify-between items-center">
                                        {/* Selected date - left */}
                                        <h3 className="font-medium text-gray-800">
                                            {format(date, "EEEE, dd/MM/yyyy", {
                                                locale: vi,
                                            })}
                                        </h3>

                                        {/* Color legend - right */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-sm"></div>
                                                <span className="text-xs text-gray-600">
                                                    Còn trống
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></div>
                                                <span className="text-xs text-gray-600">
                                                    Đang chọn
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
                                                <span className="text-xs text-gray-600">
                                                    Đã đặt
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time slots grid - cinema-style booking */}
                                    <div className="bg-gray-50 py-4 pb-6 px-4 rounded-md border border-gray-200 mb-4">
                                        <div className="text-center mb-5">
                                            <div className="text-sm text-gray-500">
                                                Chọn khung giờ bạn muốn đặt sân
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-6 gap-2 max-w-3xl mx-auto">
                                            {selectedDayAvailability.slots.map(
                                                (slot, index) => {
                                                    const isSelected =
                                                        selectedSlots.some(
                                                            (s) =>
                                                                s.start_time ===
                                                                    slot.start_time &&
                                                                s.end_time ===
                                                                    slot.end_time
                                                        );

                                                    // ✅ SỬA LỖI: Logic màu sắc và khả năng click chính xác
                                                    const getSlotStyle = () => {
                                                        // ✅ 1. Kiểm tra xem slot có booking thật không (từ booking_id)
                                                        const hasRealBooking =
                                                            !slot.is_available &&
                                                            slot.booking_id;

                                                        // ✅ 2. Kiểm tra xem slot đã qua giờ không (không có booking nhưng is_available = false)
                                                        const isPastTime =
                                                            !slot.is_available &&
                                                            !slot.booking_id;

                                                        // ✅ 3. Slot đã được đặt sân (có booking thật) - MÀU ĐỎ, không thể click
                                                        if (hasRealBooking) {
                                                            return {
                                                                className:
                                                                    "bg-red-100 border border-red-300 text-red-800 cursor-not-allowed opacity-90",
                                                                clickable:
                                                                    false,
                                                                tooltip: `Khung giờ này đã được đặt (Booking #${slot.booking_id})`,
                                                            };
                                                        }

                                                        // ✅ 4. Slot đã qua giờ - MÀU XÁM, không thể click
                                                        if (isPastTime) {
                                                            return {
                                                                className:
                                                                    "bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed opacity-60",
                                                                clickable:
                                                                    false,
                                                                tooltip:
                                                                    "Khung giờ này đã qua",
                                                            };
                                                        }

                                                        // ✅ 5. Slot đang được chọn - MÀU XANH DƯƠNG
                                                        if (isSelected) {
                                                            return {
                                                                className:
                                                                    "bg-blue-100 border border-blue-300 text-blue-800 shadow-md cursor-pointer ring-2 ring-blue-400",
                                                                clickable: true,
                                                                tooltip:
                                                                    "Click để bỏ chọn",
                                                            };
                                                        }

                                                        // ✅ 6. Slot trống, có thể đặt - MÀU XANH LÁ
                                                        return {
                                                            className:
                                                                "bg-green-100 border border-green-300 text-green-800 hover:bg-green-200 cursor-pointer hover:shadow-sm",
                                                            clickable: true,
                                                            tooltip:
                                                                "Click để chọn khung giờ này",
                                                        };
                                                    };

                                                    const slotStyle =
                                                        getSlotStyle();

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`
                    text-center py-3 px-1 rounded-md transition-all transform duration-200
                    ${slotStyle.className}
                    ${slotStyle.clickable ? "hover:scale-105" : ""}
                `}
                                                            onClick={() => {
                                                                if (
                                                                    slotStyle.clickable
                                                                ) {
                                                                    handleSlotToggle(
                                                                        slot
                                                                    );
                                                                } else {
                                                                    // ✅ Log lý do không thể click
                                                                    console.log(
                                                                        `❌ Cannot select slot ${slot.start_time}: ${slotStyle.tooltip}`
                                                                    );
                                                                }
                                                            }}
                                                            title={
                                                                slotStyle.tooltip
                                                            }
                                                        >
                                                            <div className="text-xs font-semibold">
                                                                {
                                                                    slot.start_time
                                                                }
                                                            </div>
                                                            <div className="text-xs">
                                                                {slot.end_time}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>

                                    {/* ✅ Selected slots display - Giữ lại nhưng BỎ nút tiếp theo */}
                                    {selectedSlots.length > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                                            <h4 className="font-medium text-blue-800 mb-2">
                                                Khung giờ đã chọn:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSlots
                                                    .sort((a, b) =>
                                                        a.start_time.localeCompare(
                                                            b.start_time
                                                        )
                                                    )
                                                    .map((slot, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded-md text-xs font-medium"
                                                        >
                                                            {slot.start_time} -{" "}
                                                            {slot.end_time}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-md border border-gray-100">
                                    <p className="text-gray-500">
                                        Không có khung giờ nào cho ngày này
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Hãy chọn một ngày khác
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
