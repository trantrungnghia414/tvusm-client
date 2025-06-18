"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/app/(client)/components/layout/Navbar";
import Footer from "@/app/(client)/components/layout/Footer";
import BookingSteps from "./components/BookingSteps";
import { Court } from "./types/bookingTypes";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BookingSuccess from "@/app/(client)/booking/components/BookingSuccess";
import BookingConfirm from "@/app/(client)/booking/components/BookingConfirm";
import UserInfoForm, {
    UserFormData,
} from "@/app/(client)/booking/components/UserInfoForm";
import BookingSummary from "@/app/(client)/booking/components/BookingSummary";
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

    // Animation variant
    const pageVariants = {
        initial: { opacity: 0, x: 100 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 0, x: -100 },
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5,
    };

    // Initialize with query parameters if available
    useEffect(() => {
        const initializeFromQueryParams = async () => {
            const courtId = searchParams.get("court_id");
            const date = searchParams.get("date");
            const selectedTimes = searchParams.get("selected_times");

            if (courtId && date && selectedTimes) {
                try {
                    // Lấy thông tin sân từ API
                    const response = await fetchApi(`/courts/${courtId}`);
                    if (!response.ok) {
                        throw new Error("Không thể lấy thông tin sân");
                    }

                    const courtData = await response.json();
                    setSelectedCourt(courtData);

                    // Xử lý thông tin thời gian
                    const firstTimeSlot = selectedTimes.split(",")[0];
                    const [startTime, endTime] = firstTimeSlot.split("-");

                    // Tính thời lượng (giờ)
                    const startHour = parseInt(startTime.split(":")[0]);
                    const endHour = parseInt(endTime.split(":")[0]);
                    const duration = endHour - startHour;

                    // Cập nhật state dateTime
                    setDateTime({
                        date: date,
                        startTime: startTime,
                        endTime: endTime,
                        duration: duration,
                    });

                    // Đánh dấu bước 1 đã hoàn thành và chuyển đến bước 2
                    setUserFormValid(true);
                    setCurrentStep(2);
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

    // Check if step 1 is complete
    const isStep1Complete = () => {
        return (
            selectedCourt &&
            dateTime.date &&
            dateTime.startTime &&
            dateTime.endTime
        );
    };

    // Handle next step
    const handleNextStep = () => {
        if (currentStep === 1 && !isStep1Complete()) {
            toast.error("Vui lòng chọn đầy đủ thông tin sân và thời gian");
            return;
        }

        if (currentStep === 2 && !userFormValid) {
            toast.error("Vui lòng điền đầy đủ thông tin liên hệ");
            return;
        }

        if (currentStep < 3) {
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
                // Thêm các trường bắt buộc dựa trên cấu trúc database
                booking_code: `BK${Math.floor(Math.random() * 1000000)}`,
                booking_type: "public", // hoặc 'student' hoặc 'staff' tùy loại người dùng
                user_id: undefined as number | undefined, // Khai báo thuộc tính user_id
            };

            // Nếu có token thì gắn user_id, nếu không thì để null
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

            // Đặt sân thành công
            toast.success("Đặt sân thành công!");

            // Tạo dữ liệu booking hoàn chỉnh để hiển thị
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
            setCurrentStep(4); // Move to success step
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

    // Get step heading
    const getStepHeading = () => {
        switch (currentStep) {
            case 1:
                return "Chọn Sân & Thời Gian";
            case 2:
                return "Thông Tin Liên Hệ";
            case 3:
                return "Xác Nhận Đặt Sân";
            case 4:
                return "Đặt Sân Thành Công";
            default:
                return "Đặt Sân Thể Thao";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <Navbar />

            {/* Hero section */}
            <div className="bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('/images/placeholder.jpg')] bg-repeat bg-center"></div>
                </div>
                <div className="container mx-auto px-4 py-12 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
                        Đặt Sân Thể Thao
                    </h1>
                    <p className="text-center text-blue-100 max-w-2xl mx-auto">
                        Đặt sân nhanh chóng, tiện lợi và dễ dàng. Chỉ với vài
                        bước đơn giản, bạn sẽ có một sân chơi hoàn hảo cho buổi
                        tập luyện hoặc thi đấu của mình.
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-10">
                <div className="max-w-5xl mx-auto">
                    {/* Booking steps */}
                    <BookingSteps currentStep={currentStep} />

                    {/* Step heading */}
                    <motion.h2
                        key={currentStep}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold text-center mt-10 mb-8 text-gray-800"
                    >
                        {getStepHeading()}
                    </motion.h2>

                    {/* Steps content */}
                    <motion.div
                        key={`step-${currentStep}`}
                        initial="initial"
                        animate="in"
                        exit="out"
                        variants={pageVariants}
                        transition={pageTransition}
                    >
                        {/* Step 1: Select court and time */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                    <DateTimeSelect
                                        value={dateTime}
                                        onChange={handleDateTimeChange}
                                        courtId={selectedCourt?.court_id || 0}
                                    />
                                </div>

                                {selectedCourt &&
                                    dateTime.date &&
                                    dateTime.startTime && (
                                        <div className="mt-8 animate-fadeIn">
                                            <BookingSummary
                                                courtName={selectedCourt.name}
                                                venueName={
                                                    selectedCourt.venue_name
                                                }
                                                date={dateTime.date}
                                                startTime={dateTime.startTime}
                                                endTime={dateTime.endTime}
                                                duration={dateTime.duration}
                                                hourlyRate={
                                                    selectedCourt.hourly_rate
                                                }
                                            />
                                        </div>
                                    )}

                                <div className="flex justify-end mt-8">
                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!isStep1Complete()}
                                        className="px-6 py-6 text-base bg-blue-600 hover:bg-blue-700"
                                    >
                                        Tiếp Theo{" "}
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: User info form */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <UserInfoForm
                                    value={userInfo}
                                    onChange={handleUserInfoChange}
                                    onValidityChange={setUserFormValid}
                                />

                                <div className="flex justify-between mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="px-6 py-6 text-base"
                                    >
                                        <ChevronLeft className="mr-2 h-5 w-5" />{" "}
                                        Quay Lại
                                    </Button>
                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!userFormValid}
                                        className="px-6 py-6 text-base bg-blue-600 hover:bg-blue-700"
                                    >
                                        Tiếp Theo{" "}
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Booking confirmation */}
                        {currentStep === 3 && selectedCourt && (
                            <div className="space-y-8">
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
                            </div>
                        )}

                        {/* Step 4: Booking success */}
                        {currentStep === 4 && bookingComplete && (
                            <div className="space-y-8">
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
                                        renter_name:
                                            bookingComplete.renter_name,
                                        renter_email:
                                            bookingComplete.renter_email,
                                        renter_phone:
                                            bookingComplete.renter_phone,
                                        payment_method:
                                            bookingComplete.payment_method,
                                        total_price:
                                            bookingComplete.total_price,
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Benefits section */}
            {currentStep !== 4 && (
                <div className="bg-gray-50 py-16 mt-10 border-t border-gray-100">
                    <div className="container mx-auto px-4">
                        <h3 className="text-2xl font-bold text-center mb-10">
                            Lợi Ích Khi Đặt Sân Trực Tuyến
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2">
                                    Tiết Kiệm Thời Gian
                                </h4>
                                <p className="text-gray-600">
                                    Đặt sân nhanh chóng chỉ trong vài phút,
                                    không cần gọi điện hoặc đến tận nơi.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2">
                                    Đảm Bảo Sân Trống
                                </h4>
                                <p className="text-gray-600">
                                    Đặt trước để chắc chắn có sân vào đúng thời
                                    gian bạn mong muốn.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-purple-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold mb-2">
                                    Thanh Toán Linh Hoạt
                                </h4>
                                <p className="text-gray-600">
                                    Nhiều phương thức thanh toán khác nhau, đơn
                                    giản và an toàn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
