"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { vi } from "date-fns/locale";
import { format, addDays } from "date-fns";
import { AlertCircle, Loader2 } from "lucide-react";

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

    // Giờ mở cửa và đóng cửa mặc định
    const openingHour = 6; // 6 AM
    const closingHour = 21; // 9 PM

    useEffect(() => {
        const fetchAvailability = async () => {
            setLoading(true);
            setError(null);

            try {
                const formattedDate = format(selectedDate, "yyyy-MM-dd");
                const response = await fetchApi(
                    `/courts/${courtId}/availability?date=${formattedDate}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setAvailability(data);
                } else {
                    // Tạo dữ liệu mẫu nếu API không có sẵn
                    const mockData = createMockAvailability(selectedDate);
                    setAvailability([mockData]);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
                setError("Không thể tải dữ liệu lịch đặt sân");

                // Tạo dữ liệu mẫu trong trường hợp lỗi
                const mockData = createMockAvailability(selectedDate);
                setAvailability([mockData]);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [courtId, selectedDate]);

    const createMockAvailability = (date: Date): DayAvailability => {
        const formattedDate = format(date, "yyyy-MM-dd");
        const slots: AvailabilitySlot[] = [];

        // Tạo slots từ giờ mở cửa đến giờ đóng cửa
        for (let hour = openingHour; hour < closingHour; hour++) {
            // Tạo ngẫu nhiên trạng thái sẵn có
            const isAvailable = Math.random() > 0.3; // 70% khả năng slot sẵn có

            slots.push({
                start_time: `${hour.toString().padStart(2, "0")}:00`,
                end_time: `${(hour + 1).toString().padStart(2, "0")}:00`,
                is_available: isAvailable,
            });
        }

        return {
            date: formattedDate,
            slots,
        };
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const handleBooking = (slot: AvailabilitySlot) => {
        if (!slot.is_available) return;

        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        router.push(
            `/booking?court_id=${courtId}&date=${formattedDate}&start_time=${slot.start_time}&duration=1`
        );
    };

    // Tìm dữ liệu có sẵn cho ngày đã chọn
    const selectedDayAvailability = availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd")
    );

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
                    <h3 className="text-lg font-semibold mb-4">
                        Lịch đặt sân -{" "}
                        {format(selectedDate, "EEEE, dd/MM/yyyy", {
                            locale: vi,
                        })}
                    </h3>

                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                            <span>Đang tải lịch...</span>
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Lỗi</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : selectedDayAvailability &&
                      selectedDayAvailability.slots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {selectedDayAvailability.slots.map(
                                (slot, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-md border text-center cursor-pointer transition-colors ${
                                            slot.is_available
                                                ? "bg-white border-blue-200 hover:bg-blue-50"
                                                : "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                        onClick={() =>
                                            slot.is_available &&
                                            handleBooking(slot)
                                        }
                                    >
                                        <div className="font-medium">
                                            {slot.start_time} - {slot.end_time}
                                        </div>
                                        <div
                                            className={`text-xs mt-1 ${
                                                slot.is_available
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                            }`}
                                        >
                                            {slot.is_available
                                                ? "Có thể đặt"
                                                : "Đã được đặt"}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                Không có dữ liệu lịch cho ngày này
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
