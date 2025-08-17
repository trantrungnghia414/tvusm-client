"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRightCircle } from "lucide-react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingSuccessProps {
    bookingData: {
        booking_id: string;
        court_name: string;
        venue_name: string;
        date: string;
        start_time: string;
        end_time: string;
        renter_name: string;
        renter_email: string;
        renter_phone: string;
        payment_method: string;
        total_price: number;
    };
}

export default function BookingSuccess({ bookingData }: BookingSuccessProps) {
    const router = useRouter();

    // Format date from yyyy-MM-dd to readable format
    const formatDisplayDate = (dateString: string) => {
        try {
            const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
            return format(parsedDate, "EEEE, dd/MM/yyyy", {
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

    return (
        <div className="text-center max-w-2xl mx-auto">
            <div className="bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-green-700 mb-3">
                Đặt sân thành công!
            </h3>

            <p className="text-gray-600 mb-8">
                Cảm ơn bạn đã đặt sân tại hệ thống của chúng tôi. Thông tin chi
                tiết về đơn đặt sân đã được gửi đến email của bạn.
            </p>

            {/* Booking details card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm text-left">
                <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                    Chi tiết đặt sân
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Mã đặt sân:</p>
                        <p className="font-medium">{bookingData.booking_id}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Tên sân:</p>
                        <p className="font-medium">{bookingData.court_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Cơ sở:</p>
                        <p className="font-medium">{bookingData.venue_name}</p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Ngày đặt:</p>
                        <p className="font-medium">
                            {formatDisplayDate(bookingData.date)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Thời gian:</p>
                        <p className="font-medium">
                            {bookingData.start_time} - {bookingData.end_time}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">Người đặt:</p>
                        <p className="font-medium">{bookingData.renter_name}</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500">Phương thức thanh toán:</p>
                        <p className="font-medium">
                            {bookingData.payment_method === "cash"
                                ? "Tiền mặt"
                                : bookingData.payment_method === "transfer"
                                ? "Chuyển khoản"
                                : bookingData.payment_method}
                        </p>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-900 font-medium">
                            Tổng thanh toán:
                        </p>
                        <p className="text-xl font-bold text-green-600">
                            {formatCurrency(bookingData.total_price)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action buttons - giống style trang payment result */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => router.push("/courts")}
                    className="flex-1"
                >
                    <ArrowRightCircle className="h-4 w-4 mr-2" />
                    Quay lại trang sân thể thao
                </Button>

                <Button
                    onClick={() => router.push("/bookings")}
                    className="flex-1"
                >
                    Xem lịch sử đặt sân
                </Button>
            </div>
        </div>
    );
}
