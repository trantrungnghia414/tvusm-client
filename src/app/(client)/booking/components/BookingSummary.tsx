"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Timer, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingSummaryProps {
    courtName: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    hourlyRate: number;
}

export default function BookingSummary({
    courtName,
    venueName,
    date,
    startTime,
    endTime,
    duration,
    hourlyRate,
}: BookingSummaryProps) {
    // Format date from yyyy-MM-dd to readable format
    const formatDisplayDate = (dateString: string) => {
        try {
            const [year, month, day] = dateString.split("-").map(Number);
            return format(new Date(year, month - 1, day), "EEEE, dd/MM/yyyy", {
                locale: vi,
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        })
            .format(amount)
            .replace("₫", "VNĐ");
    };

    // Calculate total price
    const totalPrice = hourlyRate * duration;

    return (
        <Card className="border-blue-100 bg-blue-50">
            <CardHeader className="pb-2">
                <CardTitle className="text-blue-800">Tóm tắt đặt sân</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Court and venue */}
                    <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">
                                {courtName}
                            </p>
                            <p className="text-gray-600 text-sm">{venueName}</p>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <CalendarDays className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">
                                {formatDisplayDate(date)}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <Timer className="h-4 w-4 text-blue-700" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">
                                {startTime} - {endTime}
                            </p>
                            <p className="text-gray-600 text-sm">
                                Thời lượng: {duration} giờ
                            </p>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                            <DollarSign className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Giá thuê:</p>
                                <p className="font-medium text-gray-800">
                                    {formatCurrency(hourlyRate)} / giờ
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-gray-600">Số giờ:</p>
                                <p className="font-medium text-gray-800">
                                    {duration} giờ
                                </p>
                            </div>
                            <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between items-center">
                                <p className="font-medium text-gray-800">
                                    Tổng tiền:
                                </p>
                                <p className="font-bold text-lg text-blue-700">
                                    {formatCurrency(totalPrice)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
