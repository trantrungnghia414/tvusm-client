// trang đặt sân
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import Navbar from "@/app/(client)/components/layout/FixedNavbar";
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

// ✅ Interface cho booking request data (được sử dụng trong handleConfirmBooking)
interface BookingRequestData {
    court_id: number;
    date: string;
    start_time: string;
    end_time: string;
    renter_name: string;
    renter_phone: string;
    renter_email?: string; // Optional
    notes: string;
}

// ✅ Interface cho user profile response
interface UserProfileResponse {
    user_id: number;
    username: string;
    fullname?: string;
    email: string;
    phone?: string;
    [key: string]: unknown;
}

export default function BookingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
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

    // ✅ State để track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

    // Check login status
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoggedIn(false);
                return;
            }

            try {
                const response = await fetchApi("/users/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData: UserProfileResponse = await response.json();
                    console.log("✅ User data loaded:", userData);
                    setIsLoggedIn(true);
                    setCurrentUserId(userData.user_id); // ✅ Lưu user ID
                    console.log("✅ User ID set to:", userData.user_id);

                    // ✅ Auto-fill user info if available
                    if (userData.fullname || userData.username) {
                        setUserInfo((prev) => ({
                            ...prev,
                            name: userData.fullname || userData.username || "",
                            email: userData.email || "",
                            phone: userData.phone || "",
                        }));
                    }
                } else {
                    localStorage.removeItem("token");
                    setIsLoggedIn(false);
                    setCurrentUserId(null); // ✅ Clear user ID khi logout
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setCurrentUserId(null); // ✅ Clear user ID khi có lỗi
            }
        };

        checkAuthStatus();
    }, []);

    // Handle court selection
    const handleCourtSelect = (court: Court | null) => {
        setSelectedCourt(court);

        // ✅ Clear datetime selection khi chọn sân mới
        if (court) {
            setDateTime({
                date: "",
                startTime: "",
                endTime: "",
                duration: 1, // Reset về default duration
            });
            setCurrentStep(2);
        }
    };

    // ✅ Handle switch back to court selection (từ nút "Đổi sân")
    const handleSwitchToCourt = () => {
        // Clear tất cả selections
        setSelectedCourt(null);
        setDateTime({
            date: "",
            startTime: "",
            endTime: "",
            duration: 1,
        });

        // Quay về step 1
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        // ✅ Check login trước khi đặt sân
        if (!isLoggedIn) {
            toast.error("Bạn cần đăng nhập để đặt sân");
            window.location.href = "/login";
            return;
        }

        if (
            !selectedCourt ||
            !dateTime.date ||
            !dateTime.startTime ||
            !userInfo.name ||
            !userInfo.phone
        ) {
            toast.error("Thiếu thông tin đặt sân");
            return;
        }

        setSubmitting(true);

        try {
            // ✅ Sử dụng interface BookingRequestData với type annotation
            const bookingData: BookingRequestData = {
                court_id: selectedCourt.court_id,
                date: dateTime.date,
                start_time: dateTime.startTime,
                end_time: dateTime.endTime,
                renter_name: userInfo.name,
                renter_phone: userInfo.phone,
                notes: userInfo.notes || "",
            };

            // ✅ Chỉ thêm email nếu có giá trị và hợp lệ
            if (userInfo.email && userInfo.email.trim()) {
                bookingData.renter_email = userInfo.email.trim();
            }

            const token = localStorage.getItem("token");

            // ✅ Kiểm tra token lần nữa
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
                window.location.href = "/login";
                return;
            }

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Bắt buộc có token
            };

            console.log("📝 Booking data:", bookingData);

            const response = await fetchApi("/bookings", {
                method: "POST",
                headers,
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                const errorData = await response.json();

                // ✅ Handle 401 Unauthorized
                if (response.status === 401) {
                    toast.error(
                        "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"
                    );
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                    return;
                }

                throw new Error(errorData.message || "Không thể tạo đặt sân");
            }

            const result = await response.json();
            console.log("✅ Booking created:", result);

            toast.success("Đặt sân thành công!");

            const completeBookingData: BookingData = {
                booking_id:
                    result.booking?.booking_id?.toString() ||
                    result.booking_id?.toString() ||
                    `BK${Math.floor(Math.random() * 10000)}`,
                court_id: selectedCourt.court_id,
                court_name: selectedCourt.name,
                venue_name: selectedCourt.venue_name,
                date: dateTime.date,
                start_time: dateTime.startTime,
                end_time: dateTime.endTime,
                duration: dateTime.duration,
                renter_name: userInfo.name,
                renter_email: userInfo.email || "",
                renter_phone: userInfo.phone,
                notes: userInfo.notes || "",
                payment_method: paymentMethod,
                total_price: selectedCourt.hourly_rate * dateTime.duration,
            };

            setBookingComplete(completeBookingData);
            setCurrentStep(5);
        } catch (error) {
            console.error("❌ Booking error:", error);
            toast.error(
                error instanceof Error ? error.message : "Có lỗi xảy ra"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Sửa lại function xử lý thanh toán VNPay
    const handleVnpayPayment = async (bookingData: BookingRequestData) => {
        console.log("🚀 Starting VNPay payment process...");
        console.log("📝 Booking data:", bookingData);

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Vui lòng đăng nhập để tiếp tục");
                router.push("/login");
                return;
            }

            console.log(
                "🔐 Token found, creating booking with VNPay method..."
            );

            // ✅ Kiểm tra user_id
            console.log(
                "🔍 Current user ID:",
                currentUserId,
                typeof currentUserId
            );

            if (!currentUserId) {
                throw new Error(
                    "Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại."
                );
            }

            // ✅ Bước 1: Tạo booking với payment_method = "vnpay"
            const bookingRequestData = {
                ...bookingData,
                payment_method: "vnpay", // ✅ QUAN TRỌNG: Đảm bảo payment method là vnpay
            };

            console.log("📝 Final booking request data:", bookingRequestData);

            const bookingResponse = await fetchApi("/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bookingRequestData),
            });

            console.log("📋 Booking response status:", bookingResponse.status);

            if (!bookingResponse.ok) {
                const errorData = await bookingResponse.json();
                console.error("❌ Booking creation failed:", errorData);
                throw new Error(errorData.message || "Không thể tạo đặt sân");
            }

            const booking = await bookingResponse.json();
            console.log("✅ Booking created successfully:", booking);

            // ✅ Bước 2: Extract booking data và validate amount
            const bookingRecord = booking.booking || booking; // Xử lý cả 2 case: {booking: {...}} và {...}
            const rawAmount =
                bookingRecord.total_amount || bookingRecord.amount;
            let amount: number;

            console.log(
                "💰 Raw amount from booking:",
                rawAmount,
                typeof rawAmount,
                "Booking data:",
                bookingRecord
            );

            if (typeof rawAmount === "string") {
                amount = parseFloat(rawAmount);
            } else if (typeof rawAmount === "number") {
                amount = rawAmount;
            } else {
                // ✅ Fallback: tính toán từ frontend
                if (!selectedCourt) {
                    throw new Error(
                        "Không thể tính toán số tiền: thiếu thông tin sân"
                    );
                }
                amount = Math.round(
                    selectedCourt.hourly_rate * dateTime.duration
                );
                console.log("💰 Calculated amount from frontend:", amount);
            }

            if (isNaN(amount) || amount <= 0) {
                throw new Error("Số tiền thanh toán không hợp lệ: " + amount);
            }

            amount = Math.max(10000, Math.round(amount)); // Tối thiểu 10,000 VND
            console.log("💳 Final validated amount:", amount);

            // ✅ Bước 3: Tạo VNPay payment - Fix booking ID detection
            const bookingId = bookingRecord.booking_id || bookingRecord.id;
            console.log(
                "🔍 Detected booking ID:",
                bookingId,
                "from response:",
                booking
            );

            if (!bookingId) {
                console.error(
                    "❌ No booking ID found in response structure:",
                    booking
                );
                throw new Error("Không thể xác định mã đặt sân từ response");
            }

            const paymentData = {
                booking_id: Number(bookingId),
                amount: amount,
                payment_method: "vnpay",
                user_id: currentUserId, // ✅ Thêm user_id
                // return_url: `${window.location.origin}/payment/result`, // ✅ Xóa để sử dụng backend config
                notes: `Thanh toán đặt sân ${
                    booking.booking_code || bookingId
                }`,
            };

            console.log("💳 Creating VNPay payment with data:", paymentData);
            console.log(
                "🔍 Final check - user_id:",
                paymentData.user_id,
                typeof paymentData.user_id
            );

            // ✅ Double check user_id before sending
            if (!paymentData.user_id) {
                throw new Error("User ID không hợp lệ: " + paymentData.user_id);
            }

            const paymentResponse = await fetchApi("/payments/vnpay/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentData),
            });

            console.log("💳 Payment response status:", paymentResponse.status);

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                console.error("❌ Payment creation failed:", errorData);
                throw new Error(
                    errorData.message || "Không thể tạo thanh toán VNPay"
                );
            }

            const paymentResult = await paymentResponse.json();
            console.log("💳 Payment result:", paymentResult);

            // ✅ Bước 4: Redirect to VNPay
            if (paymentResult.paymentUrl) {
                console.log(
                    "🔄 Redirecting to VNPay:",
                    paymentResult.paymentUrl
                );

                // ✅ Lưu thông tin booking để xử lý sau
                sessionStorage.setItem(
                    "pendingBooking",
                    JSON.stringify({
                        bookingId: bookingId,
                        amount: amount,
                        paymentId: paymentResult.paymentId,
                    })
                );

                // Redirect to VNPay
                window.location.href = paymentResult.paymentUrl;
            } else {
                throw new Error("Không nhận được URL thanh toán từ VNPay");
            }
        } catch (error) {
            console.error("💥 VNPay payment error:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi thanh toán VNPay"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ✅ Component để hiển thị yêu cầu đăng nhập
    const LoginRequiredMessage = () => (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Bạn cần đăng nhập để đặt sân
                </h2>
                <p className="text-gray-600 mb-6">
                    Vui lòng đăng nhập vào tài khoản để có thể đặt sân thể thao.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => (window.location.href = "/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        Đăng nhập
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => (window.location.href = "/register")}
                        className="w-full"
                    >
                        Đăng ký tài khoản mới
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ✅ Hiển thị login required nếu chưa đăng nhập */}
            {!isLoggedIn ? (
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-md mx-auto">
                        <LoginRequiredMessage />
                    </div>
                </div>
            ) : (
                // ✅ Hiển thị booking form nếu đã đăng nhập
                <>
                    {/* Steps Progress */}
                    <div className="bg-white py-6 border-b mt-16">
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
                                                    {currentStep >
                                                        step.number ||
                                                    isStepComplete(
                                                        step.number
                                                    ) ? (
                                                        <CheckCircle className="h-6 w-6" />
                                                    ) : (
                                                        step.icon
                                                    )}
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <div
                                                        className={`text-sm font-medium ${
                                                            currentStep >=
                                                            step.number
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
                                                            currentStep >
                                                            step.number
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
                                                Chọn sân phù hợp với nhu cầu của
                                                bạn
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <CourtSelect
                                                selectedCourtId={
                                                    selectedCourt?.court_id || 0
                                                }
                                                onCourtSelect={
                                                    handleCourtSelect
                                                }
                                                initialCourtId={parseInt(
                                                    searchParams.get(
                                                        "court_id"
                                                    ) || "0",
                                                    10
                                                )}
                                                initialVenueId={parseInt(
                                                    searchParams.get(
                                                        "venue_id"
                                                    ) || "0",
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
                                                            {
                                                                selectedCourt.venue_name
                                                            }{" "}
                                                            •{" "}
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
                                                    onClick={
                                                        handleSwitchToCourt
                                                    } // ✅ Sử dụng function mới
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
                                                Điền thông tin để hoàn tất đặt
                                                sân
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <UserInfoForm
                                                value={userInfo}
                                                onChange={handleUserInfoChange}
                                                onValidityChange={
                                                    setUserFormValid
                                                }
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
                                            venue_name:
                                                selectedCourt.venue_name,
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
                                        onVnpayPayment={handleVnpayPayment} // ✅ Đảm bảo prop này được truyền
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
                                            court_name:
                                                bookingComplete.court_name,
                                            venue_name:
                                                bookingComplete.venue_name,
                                            date: bookingComplete.date,
                                            start_time:
                                                bookingComplete.start_time,
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
                                )}
                            </motion.div>

                            {/* Navigation Buttons */}
                            {currentStep === 3 && (
                                <div className="flex justify-between mt-8">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="px-6"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Quay lại
                                    </Button>

                                    {currentStep === 3 && (
                                        <Button
                                            onClick={handleNextStep}
                                            disabled={
                                                !isStepComplete(currentStep)
                                            }
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
                </>
            )}

            <Footer />
        </div>
    );
}
