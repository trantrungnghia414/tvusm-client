"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Loader2,
    Clock,
    AlertCircle,
    RefreshCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DayAvailability {
    date: string;
    slots: TimeSlot[];
}

interface CourtBookingFormProps {
    courtId: number;
    hourlyRate: number;
}

export default function CourtBookingForm({
    courtId,
    hourlyRate,
}: CourtBookingFormProps) {
    const router = useRouter();
    const [date, setDate] = useState<Date>(new Date());
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch available slots when date changes
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
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [date, courtId]);

    const handleDateChange = (newDate: Date | undefined) => {
        if (newDate) {
            setDate(newDate);
        }
    };

    // Xử lý khi người dùng chọn một mốc thời gian
    const handleSlotToggle = (slot: TimeSlot) => {
        if (!slot.is_available) {
            toast.error("Khung giờ này đã được đặt");
            return;
        }

        // Kiểm tra xem slot đã được chọn chưa
        const isSlotSelected = selectedSlots.some(
            (s) =>
                s.start_time === slot.start_time && s.end_time === slot.end_time
        );

        // Nếu đã chọn thì bỏ chọn, ngược lại thêm vào danh sách chọn
        if (isSlotSelected) {
            setSelectedSlots(
                selectedSlots.filter(
                    (s) =>
                        !(
                            s.start_time === slot.start_time &&
                            s.end_time === slot.end_time
                        )
                )
            );
        } else {
            // Sắp xếp lại các slot theo thứ tự thời gian
            const newSelectedSlots = [...selectedSlots, slot].sort((a, b) =>
                a.start_time.localeCompare(b.start_time)
            );

            setSelectedSlots(newSelectedSlots);
        }
    };

    const handleBooking = () => {
        if (selectedSlots.length === 0) {
            toast.error("Vui lòng chọn ít nhất một khung giờ");
            return;
        }

        const formattedDate = format(date, "yyyy-MM-dd");
        const selectedTimesParam = selectedSlots
            .map((slot) => `${slot.start_time}-${slot.end_time}`)
            .join(",");

        // Chuyển hướng đến trang đặt sân với các tham số
        router.push(
            `/booking?court_id=${courtId}&date=${formattedDate}&selected_times=${selectedTimesParam}`
        );
    };

    // Thử lại khi gặp lỗi
    const handleRetry = () => {
        setError(null);
        // const formattedDate = format(date, "yyyy-MM-dd");
        router.refresh();
    };

    // Tìm dữ liệu có sẵn cho ngày đã chọn
    const selectedDayAvailability = availability.find(
        (day) => day.date === format(date, "yyyy-MM-dd")
    );

    // Kiểm tra slot có trong danh sách đã chọn không
    const isSlotSelected = (slot: TimeSlot): boolean => {
        return selectedSlots.some(
            (s) =>
                s.start_time === slot.start_time && s.end_time === slot.end_time
        );
    };

    // Tính tổng tiền dựa trên số slot đã chọn
    const calculateTotal = (): number => {
        return selectedSlots.length * hourlyRate;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">
                Đặt sân nhanh
            </h2>

            <div className="space-y-4">
                {/* Date selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Ngày đặt sân
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "EEEE, dd/MM/yyyy", {
                                    locale: vi,
                                })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateChange}
                                initialFocus
                                locale={vi}
                                disabled={
                                    (date) =>
                                        date <
                                            new Date(
                                                new Date().setHours(0, 0, 0, 0)
                                            ) || date > addDays(new Date(), 30) // Giới hạn đặt sân tối đa 30 ngày
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Show selected slots count if any */}
                {selectedSlots.length > 0 && (
                    <Badge className="w-full justify-center flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        Đã chọn {selectedSlots.length} giờ
                    </Badge>
                )}

                {/* Time slots selection */}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-medium mb-4">Chọn khung giờ</h3>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                            <span>Đang tải lịch đặt sân...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-4">
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Không thể tải dữ liệu</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Thử lại
                            </Button>
                        </div>
                    ) : selectedDayAvailability &&
                      selectedDayAvailability.slots &&
                      selectedDayAvailability.slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {selectedDayAvailability.slots.map(
                                (slot, index) => {
                                    const selected = isSlotSelected(slot);
                                    return (
                                        <div
                                            key={index}
                                            className={`
                                            p-2 rounded-md text-center cursor-pointer transition-colors
                                            ${
                                                !slot.is_available
                                                    ? "bg-red-100 text-red-800 border border-red-200"
                                                    : selected
                                                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                                                    : "bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
                                            }
                                        `}
                                            onClick={() =>
                                                handleSlotToggle(slot)
                                            }
                                        >
                                            <div className="text-sm font-medium">
                                                {slot.start_time} -{" "}
                                                {slot.end_time}
                                            </div>
                                            <div
                                                className={`text-xs mt-1 ${
                                                    !slot.is_available
                                                        ? "text-red-500"
                                                        : selected
                                                        ? "text-blue-700 font-medium"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {!slot.is_available
                                                    ? "Đã được đặt"
                                                    : selected
                                                    ? "Đã chọn"
                                                    : "Có thể đặt"}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">
                                {selectedDayAvailability
                                    ? "Không có khung giờ nào cho ngày này"
                                    : "Không có dữ liệu lịch cho ngày này"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Selected slots and total */}
                {selectedSlots.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="mb-3 sm:mb-0">
                            <p className="text-blue-700 font-medium">
                                {selectedSlots.length} khung giờ đã chọn
                            </p>
                            <div className="text-sm text-blue-600 flex flex-wrap gap-1 mt-1">
                                {selectedSlots.map((slot, index) => (
                                    <span
                                        key={index}
                                        className="bg-white px-2 py-0.5 rounded border border-blue-200"
                                    >
                                        {slot.start_time} - {slot.end_time}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Total and booking button */}
                <div className="pt-3">
                    <div className="flex justify-between items-center mb-4 px-4 py-3 bg-blue-50 rounded-md">
                        <span className="text-gray-700 font-medium">
                            Tổng tiền:
                        </span>
                        <span className="text-blue-700 font-bold">
                            {formatCurrency(calculateTotal())}
                        </span>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleBooking}
                        disabled={selectedSlots.length === 0 || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang kiểm tra
                            </>
                        ) : (
                            "Đặt sân ngay"
                        )}
                    </Button>
                </div>

                {/* Legend */}
                <div className="pt-2">
                    <div className="text-xs text-gray-500 flex flex-wrap gap-3 justify-center">
                        <div className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-green-50 border border-green-200 rounded-sm mr-1"></span>
                            <span>Có thể đặt</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-blue-100 border border-blue-300 rounded-sm mr-1"></span>
                            <span>Đã chọn</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 inline-block bg-red-100 border border-red-200 rounded-sm mr-1"></span>
                            <span>Đã được đặt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
