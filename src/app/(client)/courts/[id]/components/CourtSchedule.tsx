"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface TimeSlot {
    start_time: string;
    end_time: string;
    is_available: boolean;
}

interface DayAvailability {
    date: string;
    slots: TimeSlot[];
}

export default function CourtSchedule({ courtId }: { courtId: number }) {
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
            return; // Không thể chọn slot đã được đặt
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
            const newSelectedSlots = [...selectedSlots, slot];
            setSelectedSlots(newSelectedSlots);
        }
    };

    // Thử lại khi gặp lỗi
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
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    // Tìm dữ liệu có sẵn cho ngày đã chọn
    const selectedDayAvailability = availability.find(
        (day) => day.date === format(date, "yyyy-MM-dd")
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-5">Lịch đặt sân</h2>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Phần bên trái: Hiển thị lịch luôn */}
                <div className="md:w-1/3">
                    <div>
                        {/* Calendar hiển thị luôn */}
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

                    {/* Nút đặt sân - Chỉ disable khi chưa chọn khung giờ */}
                    <div className="mt-4">
                        <Link
                            href={`/booking?court_id=${courtId}&date=${format(
                                date,
                                "yyyy-MM-dd"
                            )}&selected_times=${selectedSlots
                                .map(
                                    (slot) =>
                                        `${slot.start_time}-${slot.end_time}`
                                )
                                .join(",")}`}
                            onClick={(e) => {
                                if (selectedSlots.length === 0) {
                                    e.preventDefault();
                                }
                            }}
                            className={
                                selectedSlots.length === 0
                                    ? "pointer-events-none"
                                    : ""
                            }
                        >
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={selectedSlots.length === 0}
                            >
                                Đặt sân ngay
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Phần bên phải: Lịch đặt sân */}
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
                                        {/* Ngày đã chọn - bên trái */}
                                        <h3 className="font-medium text-gray-800">
                                            {format(date, "EEEE, dd/MM/yyyy", {
                                                locale: vi,
                                            })}
                                        </h3>

                                        {/* Chú thích màu sắc - bên phải */}
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

                                    {/* Khu vực đặt sân kiểu rạp chiếu phim */}
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
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`
                                                            text-center py-3 px-1 rounded-md cursor-pointer transition-all transform hover:scale-105
                                                            ${
                                                                !slot.is_available
                                                                    ? "bg-red-100 border border-red-200 text-red-800"
                                                                    : isSelected
                                                                    ? "bg-blue-100 border border-blue-300 text-blue-800 shadow-md"
                                                                    : "bg-green-100 border border-green-200 text-green-800 hover:bg-green-200"
                                                            }
                                                        `}
                                                            onClick={() =>
                                                                handleSlotToggle(
                                                                    slot
                                                                )
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

                                    {/* Khung giờ đã chọn - đã dời sang bên phải */}
                                    {selectedSlots.length > 0 && (
                                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                                            <h4 className="font-medium text-blue-800 mb-2">
                                                Khung giờ đã chọn:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSlots.map(
                                                    (slot, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-white text-blue-600 border border-blue-200 px-2 py-1 rounded-md text-xs font-medium"
                                                        >
                                                            {slot.start_time} -{" "}
                                                            {slot.end_time}
                                                        </span>
                                                    )
                                                )}
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
