"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    MapPin,
    Clock,
    User,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import { Court } from "./types/bookingTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BookingSuccess from "@/app/(client)/booking/components/BookingSuccess";
import BookingConfirm from "@/app/(client)/booking/components/BookingConfirm";
import UserInfoForm, {
    UserFormData,
} from "@/app/(client)/booking/components/UserInfoForm";
import DateTimeSelect, {
    DateTimeValue,
} from "@/app/(client)/booking/components/DateTimeSelect";
import CourtSelect from "@/app/(client)/booking/components/CourtSelect";

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

export default function BookingPage() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [userFormValid, setUserFormValid] = useState(false);
    const [bookingComplete, setBookingComplete] = useState<BookingData | null>(
        null
    );

    // Data states
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [dateTime, setDateTime] = useState<DateTimeValue>({
        date: "",
        startTime: "",
        endTime: "",
        duration: 1,
    });
    const [userInfo, setUserInfo] = useState<UserFormData>({
        name: "",
        email: "",
        phone: "",
        notes: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");

    // Steps configuration
    const steps = [
        {
            number: 1,
            title: "Chọn sân",
            icon: <MapPin className="h-5 w-5" />,
            description: "Chọn sân thể thao",
        },
        {
            number: 2,
            title: "Chọn thời gian",
            icon: <Clock className="h-5 w-5" />,
            description: "Chọn ngày & giờ",
        },
        {
            number: 3,
            title: "Thông tin",
            icon: <User className="h-5 w-5" />,
            description: "Điền thông tin liên hệ",
        },
        {
            number: 4,
            title: "Thanh toán",
            icon: <CreditCard className="h-5 w-5" />,
            description: "Xác nhận & thanh toán",
        },
    ];

    // Initialize with query parameters if available
    useEffect(() => {
        const initializeFromQueryParams = async () => {
            const courtId = searchParams.get("court_id");
            const date = searchParams.get("date");
            const selectedTimes = searchParams.get("selected_times");

            if (courtId && date && selectedTimes) {
                try {
                    const response = await fetchApi(`/courts/${courtId}`);
                    if (!response.ok) {
                        throw new Error("Không thể lấy thông tin sân");
                    }

                    const courtData = await response.json();
                    setSelectedCourt(courtData);

                    const firstTimeSlot = selectedTimes.split(",")[0];
                    const [startTime, endTime] = firstTimeSlot.split("-");

                    const startHour = parseInt(startTime.split(":")[0]);
                    const endHour = parseInt(endTime.split(":")[0]);
                    const duration = endHour - startHour;

                    setDateTime({
                        date: date,
                        startTime: startTime,
                        endTime: endTime,
                        duration: duration,
                    });

                    setCurrentStep(3);
                } catch (error) {
                    console.error(
                        "Error initializing from query params:",
                        error
                    );
                    toast.error("Không thể tự động điền thông tin đặt sân");
                }
            }
        };

        initializeFromQueryParams();
    }, [searchParams]);

    // Handle court selection
    const handleCourtSelect = (court: Court | null) => {
        setSelectedCourt(court);
        if (court) {
            setCurrentStep(2);
        }
    };

    // Handle date time selection
    const handleDateTimeChange = (newDateTime: DateTimeValue) => {
        setDateTime(newDateTime);
    };

    // Handle user form data change
    const handleUserInfoChange = (data: UserFormData) => {
        setUserInfo(data);
    };

    // Handle payment method change
    const handlePaymentMethodChange = (method: string) => {
        setPaymentMethod(method);
    };

    // Check if step is complete
    const isStepComplete = (step: number) => {
        switch (step) {
            case 1:
                return !!selectedCourt;
            case 2:
                return (
                    selectedCourt &&
                    dateTime.date &&
                    dateTime.startTime &&
                    dateTime.endTime
                );
            case 3:
                return userFormValid;
            case 4:
                return true;
            default:
                return false;
        }
    };

    // Handle next step
    const handleNextStep = () => {
        if (currentStep === 1 && !selectedCourt) {
            toast.error("Vui lòng chọn sân");
            return;
        }

        if (currentStep === 2 && (!dateTime.date || !dateTime.startTime)) {
            toast.error("Vui lòng chọn thời gian");
            return;
        }

        if (currentStep === 3 && !userFormValid) {
            toast.error("Vui lòng điền đầy đủ thông tin liên hệ");
            return;
        }

        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Handle back
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Handle booking confirmation
    const handleConfirmBooking = async () => {
        if (
            !selectedCourt ||
            !dateTime.date ||
            !dateTime.startTime ||
            !userInfo.name
        ) {
            toast.error("Thiếu thông tin đặt sân");
            return;
        }

        setSubmitting(true);

        try {
            const bookingData = {
                court_id: selectedCourt.court_id,
                date: dateTime.date,
                start_time: dateTime.startTime,
                end_time: dateTime.endTime,
                renter_name: userInfo.name,
                renter_email: userInfo.email,
                renter_phone: userInfo.phone,
                notes: userInfo.notes,
                booking_code: `BK${Math.floor(Math.random() * 1000000)}`,
                booking_type: "public",
                user_id: undefined as number | undefined,
            };

            if (localStorage.getItem("token")) {
                const userResponse = await fetchApi("/users/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    bookingData.user_id = userData.user_id;
                }
            }

            const token = localStorage.getItem("token");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetchApi("/bookings", {
                method: "POST",
                headers,
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể hoàn tất đặt sân"
                );
            }

            const responseData = await response.json();

            toast.success("Đặt sân thành công!");

            const completeBookingData: BookingData = {
                booking_id:
                    responseData.booking_id ||
                    `BK${Math.floor(Math.random() * 10000)}`,
                court_id: selectedCourt.court_id,
                court_name: selectedCourt.name,
                venue_name: selectedCourt.venue_name,
                date: dateTime.date,
                start_time: dateTime.startTime,
                end_time: dateTime.endTime,
                duration: dateTime.duration,
                renter_name: userInfo.name,
                renter_email: userInfo.email,
                renter_phone: userInfo.phone,
                notes: userInfo.notes,
                payment_method: paymentMethod,
                total_price: selectedCourt.hourly_rate * dateTime.duration,
            };

            setBookingComplete(completeBookingData);
            setCurrentStep(5);
        } catch (error) {
            console.error("Error booking court:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Đã xảy ra lỗi khi đặt sân"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Header Section */}
            <div className="bg-blue-400 shadow-sm border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center bg-amber-400">
                        {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Đặt sân thể thao
                        </h1>
                        <p className="text-gray-600">
                            Đặt sân nhanh chóng, tiện lợi trong vài bước đơn
                            giản
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Steps Progress */}
            <div className="bg-white py-6 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-8 max-w-4xl w-full">
                            {steps.map((step, index) => (
                                <div
                                    key={step.number}
                                    className="flex items-center flex-1"
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`
                                                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                                                ${
                                                    currentStep > step.number
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : currentStep ===
                                                          step.number
                                                        ? "bg-blue-500 border-blue-500 text-white"
                                                        : isStepComplete(
                                                              step.number
                                                          )
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : "bg-gray-100 border-gray-300 text-gray-400"
                                                }
                                            `}
                                        >
                                            {currentStep > step.number ||
                                            isStepComplete(step.number) ? (
                                                <CheckCircle className="h-6 w-6" />
                                            ) : (
                                                step.icon
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div
                                                className={`text-sm font-medium ${
                                                    currentStep >= step.number
                                                        ? "text-gray-900"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connector line */}
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-4 mt-6">
                                            <div
                                                className={`h-full transition-all ${
                                                    currentStep > step.number
                                                        ? "bg-green-500"
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        key={`step-${currentStep}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Step 1: Select Court */}
                        {currentStep === 1 && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Chọn sân thể thao
                                    </h2>
                                    <p className="text-gray-600">
                                        Chọn sân phù hợp với nhu cầu của bạn
                                    </p>
                                </div>
                                <div className="p-6">
                                    <CourtSelect
                                        selectedCourtId={
                                            selectedCourt?.court_id || 0
                                        }
                                        onCourtSelect={handleCourtSelect}
                                        initialCourtId={parseInt(
                                            searchParams.get("court_id") || "0",
                                            10
                                        )}
                                        initialVenueId={parseInt(
                                            searchParams.get("venue_id") || "0",
                                            10
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Time */}
                        {currentStep === 2 && selectedCourt && (
                            <div className="space-y-6">
                                {/* Selected Court Info */}
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-900">
                                                    {selectedCourt.name}
                                                </h3>
                                                <p className="text-blue-700 text-sm">
                                                    {selectedCourt.venue_name} •{" "}
                                                    {selectedCourt.hourly_rate.toLocaleString(
                                                        "vi-VN"
                                                    )}
                                                    đ/giờ
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentStep(1)}
                                            className="text-blue-600 border-blue-300"
                                        >
                                            Đổi sân
                                        </Button>
                                    </div>
                                </div>

                                {/* DateTime Selection */}
                                <DateTimeSelect
                                    value={dateTime}
                                    onChange={handleDateTimeChange}
                                    courtId={selectedCourt.court_id}
                                    onNext={handleNextStep}
                                />
                            </div>
                        )}

                        {/* Step 3: User Info */}
                        {currentStep === 3 && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Thông tin liên hệ
                                    </h2>
                                    <p className="text-gray-600">
                                        Điền thông tin để hoàn tất đặt sân
                                    </p>
                                </div>
                                <div className="p-6">
                                    <UserInfoForm
                                        value={userInfo}
                                        onChange={handleUserInfoChange}
                                        onValidityChange={setUserFormValid}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirmation */}
                        {currentStep === 4 && selectedCourt && (
                            <BookingConfirm
                                bookingData={{
                                    court_id: selectedCourt.court_id,
                                    court_name: selectedCourt.name,
                                    venue_name: selectedCourt.venue_name,
                                    date: dateTime.date,
                                    start_time: dateTime.startTime,
                                    end_time: dateTime.endTime,
                                    duration: dateTime.duration,
                                    renter_name: userInfo.name,
                                    renter_email: userInfo.email,
                                    renter_phone: userInfo.phone,
                                    notes: userInfo.notes || "",
                                    payment_method: paymentMethod,
                                    total_price:
                                        selectedCourt.hourly_rate *
                                        dateTime.duration,
                                }}
                                onBack={handleBack}
                                onConfirm={handleConfirmBooking}
                                isSubmitting={submitting}
                                onPaymentMethodChange={
                                    handlePaymentMethodChange
                                }
                                selectedPaymentMethod={paymentMethod}
                            />
                        )}

                        {/* Step 5: Success */}
                        {currentStep === 5 && bookingComplete && (
                            <BookingSuccess
                                bookingData={{
                                    booking_id:
                                        bookingComplete.booking_id ||
                                        `BK${Math.floor(
                                            Math.random() * 10000
                                        )}`,
                                    court_name: bookingComplete.court_name,
                                    venue_name: bookingComplete.venue_name,
                                    date: bookingComplete.date,
                                    start_time: bookingComplete.start_time,
                                    end_time: bookingComplete.end_time,
                                    renter_name: bookingComplete.renter_name,
                                    renter_email: bookingComplete.renter_email,
                                    renter_phone: bookingComplete.renter_phone,
                                    payment_method:
                                        bookingComplete.payment_method,
                                    total_price: bookingComplete.total_price,
                                }}
                            />
                        )}
                    </motion.div>

                    {/* Navigation Buttons */}
                    {currentStep < 5 && currentStep !== 2 && (
                        <div className="flex justify-between mt-8">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className="px-6"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>

                            {currentStep < 4 && (
                                <Button
                                    onClick={handleNextStep}
                                    disabled={!isStepComplete(currentStep)}
                                    className="px-6 bg-blue-600 hover:bg-blue-700"
                                >
                                    Tiếp theo
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
