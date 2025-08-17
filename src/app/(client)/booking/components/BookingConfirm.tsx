"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChevronLeft,
    Loader2,
    MapPin,
    Clock,
    User,
    CreditCard,
    FileText,
} from "lucide-react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import PaymentMethods from "./PaymentMethods";

// ✅ Thêm interface BookingRequestData vào BookingConfirm.tsx
interface BookingRequestData {
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    renter_name: string;
    renter_phone: string;
    renter_email?: string;
    notes: string;
}

interface BookingData {
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
    booking_id?: string;
}

interface BookingConfirmProps {
    bookingData: BookingData;
    onBack: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    onPaymentMethodChange: (method: string) => void;
    selectedPaymentMethod: string;
    onVnpayPayment?: (bookingData: BookingRequestData) => void;
}

export default function BookingConfirm({
    bookingData,
    onBack,
    onConfirm,
    isSubmitting,
    onPaymentMethodChange,
    selectedPaymentMethod,
    onVnpayPayment,
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

    // ✅ Handle confirm với payment method
    const handleConfirm = () => {
        console.log(
            "🔍 Confirm clicked with payment method:",
            selectedPaymentMethod
        );

        if (selectedPaymentMethod === "vnpay" && onVnpayPayment) {
            console.log("🔍 Processing VNPay payment...");

            // Tạo BookingRequestData từ BookingData
            const requestData: BookingRequestData = {
                court_id: bookingData.court_id,
                date: bookingData.date,
                start_time: bookingData.start_time,
                end_time: bookingData.end_time,
                renter_name: bookingData.renter_name,
                renter_phone: bookingData.renter_phone,
                renter_email: bookingData.renter_email || undefined,
                notes: bookingData.notes || "",
            };

            console.log("🔍 Calling onVnpayPayment with data:", requestData);
            onVnpayPayment(requestData);
        } else {
            console.log("🔍 Processing cash payment...");
            onConfirm();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Booking Details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Court & Time Info - Compact */}
                    <Card className="border-gray-200">
                        <CardContent className="p-4">
                            <div className="space-y-4">
                                {/* Court Info */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {bookingData.court_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {bookingData.venue_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Time Info */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <Clock className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {formatDisplayDate(
                                                bookingData.date
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {bookingData.start_time} -{" "}
                                            {bookingData.end_time}
                                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                {bookingData.duration} giờ
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <User className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {bookingData.renter_name}
                                        </h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>{bookingData.renter_email}</p>
                                            <p>{bookingData.renter_phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {bookingData.notes && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-orange-50 rounded-lg">
                                            <FileText className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">
                                                Ghi chú
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {bookingData.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods - Compact */}
                    <Card className="border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                Phương thức thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <PaymentMethods
                                selectedMethod={selectedPaymentMethod}
                                onMethodChange={onPaymentMethodChange}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-4">
                    {/* Price Breakdown */}
                    <Card className="border-gray-200">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">
                                Chi tiết giá
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Giá sân/giờ:
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            bookingData.total_price /
                                                bookingData.duration
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Thời lượng:
                                    </span>
                                    <span className="font-medium">
                                        {bookingData.duration} giờ
                                    </span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">
                                            Tổng cộng:
                                        </span>
                                        <span className="font-bold text-lg text-blue-600">
                                            {formatCurrency(
                                                bookingData.total_price
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Notes - Compact */}
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                💡 Lưu ý quan trọng
                            </h3>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>• Đến đúng giờ đã đặt</li>
                                <li>• Hủy trước 24h nếu có thay đổi</li>
                                <li>• Mang giày và trang phục phù hợp</li>
                                <li>• Tuân thủ nội quy cơ sở</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="p-6 border-t bg-gray-50 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>

                        <Button
                            onClick={handleConfirm} // ✅ Sử dụng handleConfirm
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {selectedPaymentMethod === "vnpay"
                                ? "Thanh toán VNPay"
                                : "Xác nhận đặt sân"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
