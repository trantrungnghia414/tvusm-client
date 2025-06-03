"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import PaymentMethods from "./PaymentMethods";

interface BookingConfirmProps {
    bookingData: {
        court_id: number;
        court_name: string;
        venue_name: string;
        date: string;
        start_time: string;
        end_time: string;
        duration: number;
        renter_name: string;
        renter_email: string;
        renter_phone: string;
        notes: string;
        payment_method: string;
        total_price: number;
    };
    onBack: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    onPaymentMethodChange: (method: string) => void;
    selectedPaymentMethod: string;
}

export default function BookingConfirm({
    bookingData,
    onBack,
    onConfirm,
    isSubmitting,
    onPaymentMethodChange,
    selectedPaymentMethod,
}: BookingConfirmProps) {
    // Format date from yyyy-MM-dd to readable format
    const formatDisplayDate = (dateString: string) => {
        try {
            const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
            return format(parsedDate, "EEEE, dd/MM/yyyy", {
                locale: vi,
            });
        } catch (error) {
            console.error("Error parsing date:", error);
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
        <div className="space-y-6">
            {/* Booking summary */}
            <Card className="border-blue-100">
                <CardHeader className="pb-2">
                    <CardTitle>Thông tin đặt sân</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Court and venue info */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">
                                Thông tin sân đã chọn
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Tên sân:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.court_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Cơ sở:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.venue_name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date and time */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">
                                Thời gian đặt sân
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Ngày đặt:
                                    </p>
                                    <p className="font-medium">
                                        {formatDisplayDate(bookingData.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Thời gian:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.start_time} -{" "}
                                        {bookingData.end_time} (
                                        {bookingData.duration} giờ)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Renter info */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">
                                Thông tin người đặt
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Họ tên:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.renter_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.renter_email}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Số điện thoại:
                                    </p>
                                    <p className="font-medium">
                                        {bookingData.renter_phone}
                                    </p>
                                </div>
                                {bookingData.notes && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-500">
                                            Ghi chú:
                                        </p>
                                        <p className="font-medium">
                                            {bookingData.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-lg mb-2 text-blue-700">
                                Chi phí đặt sân
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Giá thuê sân:
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            bookingData.total_price /
                                                bookingData.duration
                                        )}{" "}
                                        / giờ
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Thời lượng:
                                    </span>
                                    <span className="font-medium">
                                        {bookingData.duration} giờ
                                    </span>
                                </div>
                                <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-lg text-blue-700">
                                        {formatCurrency(
                                            bookingData.total_price
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment methods */}
                        <div className="p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-lg mb-4">
                                Phương thức thanh toán
                            </h3>
                            <PaymentMethods
                                selectedMethod={selectedPaymentMethod}
                                onMethodChange={onPaymentMethodChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Terms and confirm */}
            <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-700 mb-2">
                        Lưu ý:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-amber-800">
                        <li>
                            Vui lòng đến đúng giờ để không ảnh hưởng đến lịch
                            đặt sân sau.
                        </li>
                        <li>
                            Nếu hủy sân, vui lòng thông báo trước ít nhất 24
                            giờ.
                        </li>
                        <li>
                            Mang theo giày và trang phục phù hợp khi sử dụng
                            sân.
                        </li>
                        <li>Tuân thủ nội quy của cơ sở thể thao.</li>
                    </ul>
                </div>

                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt sân"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
