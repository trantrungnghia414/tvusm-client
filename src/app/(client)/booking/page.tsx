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
import DateTimeSelect, {
    DateTimeValue,
} from "@/app/(client)/booking/components/DateTimeSelect";
import CourtSelect from "@/app/(client)/booking/components/CourtSelect";
import { Calendar, MapPin } from "lucide-react";

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

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    disabled?: boolean;
}

export default function BookingPage() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [userFormValid, setUserFormValid] = useState(false);
    const [bookingComplete, setBookingComplete] = useState<BookingData | null>(
        null
    );
    const [activeTab, setActiveTab] = useState("court");
    const [allowAutoSwitch, setAllowAutoSwitch] = useState(true);

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

    // Animation variants
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

    // Tab configuration - ALWAYS disable datetime tab when no court selected
    const tabs: TabItem[] = [
        {
            id: "court",
            label: "Chọn Sân",
            icon: <MapPin className="h-4 w-4 mr-1" />,
            disabled: false, // Always enabled
        },
        {
            id: "datetime",
            label: "Chọn Thời Gian",
            icon: <Calendar className="h-4 w-4 mr-1" />,
            disabled: !selectedCourt, // ✅ Disabled when no court selected
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

    // Modified auto-switch logic with control flag
    useEffect(() => {
        if (selectedCourt && activeTab === "court" && allowAutoSwitch) {
            console.log("Auto-switching to datetime tab...");
            setActiveTab("datetime");
        }
    }, [selectedCourt, activeTab, allowAutoSwitch]);

    // ✅ Optimized handleSwitchToCourt - Single state update batch
    const handleSwitchToCourt = () => {
        console.log("Switching to court tab and clearing selection...");

        // ✅ Prevent auto-switch during manual operation
        setAllowAutoSwitch(false);

        // ✅ Single batched state update to prevent multiple re-renders
        Promise.resolve()
            .then(() => {
                setSelectedCourt(null);
                setDateTime({
                    date: "",
                    startTime: "",
                    endTime: "",
                    duration: 1,
                });
                setActiveTab("court");
            })
            .then(() => {
                // ✅ Re-enable auto-switch after state updates complete
                setTimeout(() => {
                    setAllowAutoSwitch(true);
                }, 50); // Minimal delay
            });
    };

    // Handle court selection
    const handleCourtSelect = (court: Court | null) => {
        setSelectedCourt(court);

        // If deselecting a court, clear the date/time and switch back to court tab
        if (!court) {
            setDateTime({
                date: "",
                startTime: "",
                endTime: "",
                duration: 1,
            });
            setActiveTab("court");
            setAllowAutoSwitch(true);
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
            setCurrentStep(4);
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

            {/* Compact Hero section */}
            <div className="bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('/images/placeholder.jpg')] bg-repeat bg-center"></div>
                </div>
                <div className="container mx-auto px-4 py-6 relative z-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-2">
                        Đặt Sân Thể Thao
                    </h1>
                    <p className="text-center text-blue-100 max-w-xl mx-auto text-sm">
                        Đặt sân nhanh chóng, tiện lợi và dễ dàng
                    </p>
                </div>
            </div>

            <main className="container mx-auto px-4 py-4">
                <div className="max-w-7xl mx-auto">
                    {/* Compact Booking steps */}
                    <div className="mb-4">
                        <BookingSteps currentStep={currentStep} />
                    </div>

                    {/* Step heading */}
                    <motion.h2
                        key={currentStep}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-bold text-center mb-4 text-gray-800"
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
                        {/* Step 1: Select court and time - FULL WIDTH */}
                        {currentStep === 1 && (
                            <div className="max-w-6xl mx-auto">
                                {/* Tabs navigation */}
                                <div className="mb-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="flex overflow-x-auto no-scrollbar">
                                            <div className="flex w-full">
                                                {tabs.map((tab) => (
                                                    <div
                                                        key={tab.id}
                                                        className={`
                                                            flex items-center justify-center whitespace-nowrap font-medium transition-colors
                                                            py-3 px-6 text-sm flex-1
                                                            ${
                                                                activeTab ===
                                                                tab.id
                                                                    ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                                                                    : tab.disabled
                                                                    ? "text-gray-400 border-b-2 border-transparent"
                                                                    : "text-gray-600 border-b-2 border-transparent"
                                                            }
                                                        `}
                                                        style={{
                                                            cursor: "default", // ✅ Cursor bình thường cho tất cả tabs
                                                        }}
                                                    >
                                                        {tab.icon}
                                                        {tab.label}
                                                        {/* Status indicators */}
                                                        {tab.id === "court" &&
                                                            selectedCourt && (
                                                                <span className="ml-2 h-1.5 w-1.5 bg-green-400 rounded-full"></span>
                                                            )}
                                                        {tab.id ===
                                                            "datetime" &&
                                                            dateTime.date &&
                                                            dateTime.startTime && (
                                                                <span className="ml-2 h-1.5 w-1.5 bg-green-400 rounded-full"></span>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Contents - Full Width */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    {activeTab === "court" && (
                                        <div>
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

                                            {selectedCourt && (
                                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
                                                    <Button
                                                        onClick={() => {
                                                            setAllowAutoSwitch(
                                                                false
                                                            );
                                                            setActiveTab(
                                                                "datetime"
                                                            );
                                                            setTimeout(() => {
                                                                setAllowAutoSwitch(
                                                                    true
                                                                );
                                                            }, 500);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700"
                                                        size="sm"
                                                    >
                                                        Tiếp theo: Chọn thời
                                                        gian
                                                        <ChevronRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "datetime" && (
                                        <div>
                                            {selectedCourt && (
                                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-blue-600 text-sm">
                                                                Sân đã chọn:{" "}
                                                            </span>
                                                            <span className="font-medium text-blue-800">
                                                                {
                                                                    selectedCourt.name
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-blue-600">
                                                                {selectedCourt.hourly_rate.toLocaleString(
                                                                    "vi-VN"
                                                                )}
                                                                đ/giờ
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={
                                                                    handleSwitchToCourt
                                                                }
                                                                className="text-xs px-2 py-1 h-6"
                                                            >
                                                                Đổi sân
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <DateTimeSelect
                                                value={dateTime}
                                                onChange={handleDateTimeChange}
                                                courtId={
                                                    selectedCourt?.court_id || 0
                                                }
                                            />

                                            {dateTime.date &&
                                                dateTime.startTime && (
                                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
                                                        <Button
                                                            onClick={
                                                                handleNextStep
                                                            }
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                            size="sm"
                                                        >
                                                            Tiếp theo: Điền
                                                            thông tin liên hệ
                                                            <ChevronRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: User info form - Full Width */}
                        {currentStep === 2 && (
                            <div className="max-w-4xl mx-auto">
                                <UserInfoForm
                                    value={userInfo}
                                    onChange={handleUserInfoChange}
                                    onValidityChange={setUserFormValid}
                                />

                                <div className="flex justify-between mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        className="px-6 py-2"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Quay Lại
                                    </Button>
                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!userFormValid}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        Tiếp Theo
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Booking confirmation */}
                        {currentStep === 3 && selectedCourt && (
                            <div className="max-w-5xl mx-auto">
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
                            <div className="max-w-5xl mx-auto">
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

            <Footer />
        </div>
    );
}
