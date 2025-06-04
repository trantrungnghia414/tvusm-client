"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { vi } from "date-fns/locale";
import { format, addDays } from "date-fns";
import { AlertCircle, Loader2, Clock, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AvailabilitySlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DayAvailability {
    date: string;
    slots: AvailabilitySlot[];
}

interface CourtScheduleProps {
    courtId: number;
}

export default function CourtSchedule({ courtId }: CourtScheduleProps) {
    const router = useRouter();
    const [availability, setAvailability] = useState<DayAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Thêm state để lưu các mốc thời gian đã chọn
    const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([]);

    // Giờ mở cửa và đóng cửa mặc định (sẽ được thay thế bởi dữ liệu từ API)
    // const openingHour = 6; // 6 AM
    // const closingHour = 22; // 10 PM

    // Fetch lịch đặt sân từ API
    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            setError(null);

            // Reset selected slots when date changes
            setSelectedSlots([]);

            try {
                // Format date as YYYY-MM-DD for API call
                const formattedDate = format(selectedDate, "yyyy-MM-dd");

                // Gọi API để lấy thông tin lịch đặt sân theo ngày
                const response = await fetchApi(
                    `/courts/${courtId}/availability?date=${formattedDate}`
                );

                if (!response.ok) {
                    throw new Error("Không thể tải dữ liệu lịch đặt sân");
                }

                const data = await response.json();

                // Kiểm tra cấu trúc dữ liệu từ API
                if (!Array.isArray(data)) {
                    console.warn(
                        "Dữ liệu lịch đặt sân không đúng định dạng:",
                        data
                    );
                    setAvailability([]);
                    return;
                }

                setAvailability(data);
            } catch (error) {
                console.error("Error fetching court availability:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Không thể tải dữ liệu lịch đặt sân"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [courtId, selectedDate]);

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    // Xử lý khi người dùng chọn một mốc thời gian
    const handleSlotToggle = (slot: AvailabilitySlot) => {
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

    // Xử lý khi người dùng nhấn nút đặt sân
    const handleBookMultipleSlots = () => {
        if (selectedSlots.length === 0) {
            toast.error("Vui lòng chọn ít nhất một khung giờ");
            return;
        }

        const formattedDate = format(selectedDate, "yyyy-MM-dd");

        // Thay vì chỉ lấy giờ bắt đầu và duration, chúng ta sẽ truyền tất cả các slot được chọn
        const selectedTimesParam = selectedSlots
            .map((slot) => `${slot.start_time}-${slot.end_time}`)
            .join(",");

        router.push(
            `/booking?court_id=${courtId}&date=${formattedDate}&selected_times=${selectedTimesParam}`
        );
    };

    // Thử lại khi gặp lỗi
    const handleRetry = () => {
        setError(null);
        // const formattedDate = format(selectedDate, "yyyy-MM-dd");
        router.refresh();
    };

    // Tìm dữ liệu có sẵn cho ngày đã chọn
    const selectedDayAvailability = availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd")
    );

    // Kiểm tra slot có trong danh sách đã chọn không
    const isSlotSelected = (slot: AvailabilitySlot): boolean => {
        return selectedSlots.some(
            (s) =>
                s.start_time === slot.start_time && s.end_time === slot.end_time
        );
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold mb-4">Chọn ngày</h3>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        locale={vi}
                        disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date > addDays(new Date(), 30)
                        }
                        initialFocus
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            Lịch đặt sân -{" "}
                            {format(selectedDate, "EEEE, dd/MM/yyyy", {
                                locale: vi,
                            })}
                        </h3>

                        {selectedSlots.length > 0 && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
                            >
                                <Clock className="h-3.5 w-3.5" />
                                Đã chọn {selectedSlots.length} giờ
                            </Badge>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                            <span>Đang tải lịch đặt sân...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Không thể tải dữ liệu</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                Thử lại
                            </Button>
                        </div>
                    ) : selectedDayAvailability &&
                      selectedDayAvailability.slots &&
                      selectedDayAvailability.slots.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {selectedDayAvailability.slots.map(
                                    (slot, index) => {
                                        const selected = isSlotSelected(slot);

                                        return (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-md border text-center cursor-pointer transition-all ${
                                                    !slot.is_available
                                                        ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                                                        : selected
                                                        ? "bg-blue-100 border-blue-400 shadow-sm"
                                                        : "bg-white border-blue-200 hover:bg-blue-50"
                                                }`}
                                                onClick={() =>
                                                    handleSlotToggle(slot)
                                                }
                                            >
                                                <div className="font-medium">
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

                            {selectedSlots.length > 0 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="mb-3 sm:mb-0">
                                        <p className="text-blue-700 font-medium">
                                            {selectedSlots.length} khung giờ đã
                                            chọn
                                        </p>
                                        <div className="text-sm text-blue-600 flex flex-wrap gap-1 mt-1">
                                            {selectedSlots.map(
                                                (slot, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-white px-2 py-0.5 rounded border border-blue-200"
                                                    >
                                                        {slot.start_time} -{" "}
                                                        {slot.end_time}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleBookMultipleSlots}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Đặt sân ngay
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {selectedDayAvailability
                                    ? "Không có khung giờ nào cho ngày này"
                                    : "Không có dữ liệu lịch cho ngày này"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Đặt sân trọn ngày hoặc theo sự kiện?
                        </h3>
                        <p className="text-blue-700">
                            Liên hệ với chúng tôi để được tư vấn và hỗ trợ đặt
                            sân cho sự kiện hoặc sử dụng dài hạn
                        </p>
                    </div>
                    <Button onClick={() => window.open("/contact", "_blank")}>
                        Liên hệ ngay
                    </Button>
                </div>
            </div>
        </div>
    );
}
