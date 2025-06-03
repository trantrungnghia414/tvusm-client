"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CourtBookingFormProps {
    courtId: number;
    hourlyRate: number;
}

export default function CourtBookingForm({
    courtId,
    hourlyRate,
}: CourtBookingFormProps) {
    const router = useRouter();
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<string>("");
    const [duration, setDuration] = useState<string>("1");

    const handleBooking = () => {
        if (!date || !startTime) {
            alert("Vui lòng chọn ngày và giờ đặt sân");
            return;
        }

        // Định dạng ngày tháng thành yyyy-MM-dd
        const formattedDate = format(date, "yyyy-MM-dd");

        // Chuyển hướng đến trang đặt sân với các tham số
        router.push(
            `/booking?court_id=${courtId}&date=${formattedDate}&start_time=${startTime}&duration=${duration}`
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">
                Đặt sân nhanh
            </h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Ngày đặt
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date
                                    ? format(date, "P", { locale: vi })
                                    : "Chọn ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={vi}
                                disabled={(date) =>
                                    date <
                                    new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Giờ bắt đầu
                    </label>
                    <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="06:00">06:00</SelectItem>
                            <SelectItem value="07:00">07:00</SelectItem>
                            <SelectItem value="08:00">08:00</SelectItem>
                            <SelectItem value="09:00">09:00</SelectItem>
                            <SelectItem value="10:00">10:00</SelectItem>
                            <SelectItem value="11:00">11:00</SelectItem>
                            <SelectItem value="12:00">12:00</SelectItem>
                            <SelectItem value="13:00">13:00</SelectItem>
                            <SelectItem value="14:00">14:00</SelectItem>
                            <SelectItem value="15:00">15:00</SelectItem>
                            <SelectItem value="16:00">16:00</SelectItem>
                            <SelectItem value="17:00">17:00</SelectItem>
                            <SelectItem value="18:00">18:00</SelectItem>
                            <SelectItem value="19:00">19:00</SelectItem>
                            <SelectItem value="20:00">20:00</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                        Thời lượng
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn thời lượng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 giờ</SelectItem>
                            <SelectItem value="2">2 giờ</SelectItem>
                            <SelectItem value="3">3 giờ</SelectItem>
                            <SelectItem value="4">4 giờ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-2">
                    <div className="flex justify-between items-center mb-4 px-4 py-3 bg-blue-50 rounded-md">
                        <span className="text-gray-700 font-medium">
                            Tổng tiền:
                        </span>
                        <span className="text-blue-700 font-bold">
                            {formatCurrency(
                                hourlyRate * parseInt(duration || "1")
                            )}
                        </span>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleBooking}
                        disabled={!date || !startTime}
                    >
                        Đặt sân ngay
                    </Button>
                </div>
            </div>
        </div>
    );
}
