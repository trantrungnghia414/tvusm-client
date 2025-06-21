// client/src/app/(admin)/dashboard/bookings/components/BookingForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CalendarIcon,
    Clock,
    User,
    MapPin,
    DollarSign,
    Save,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CreateBookingDto } from "../types/booking";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Court {
    court_id: number;
    name: string;
    type_name: string;
    venue_name: string;
    hourly_rate: number;
}

interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    phone?: string;
}

// ✅ Thêm interface cho dữ liệu thô từ API
interface RawCourtData {
    court_id: number;
    name: string;
    type_name?: string;
    venue_name?: string;
    hourly_rate?: number;
    court_type?: {
        name: string;
    };
    venue?: {
        name: string;
    };
}

interface RawUserData {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    name?: string;
    phone?: string;
}

interface BookingFormProps {
    onSubmit: (data: CreateBookingDto) => void;
    submitting?: boolean;
    initialData?: Partial<CreateBookingDto>;
}

export default function BookingForm({
    onSubmit,
    submitting = false,
    initialData,
}: BookingFormProps) {
    // Form states
    const [formData, setFormData] = useState<CreateBookingDto>({
        user_id: initialData?.user_id,
        court_id: initialData?.court_id || 0,
        date: initialData?.date || "",
        start_time: initialData?.start_time || "",
        end_time: initialData?.end_time || "",
        total_amount: initialData?.total_amount,
        notes: initialData?.notes || "",
        customer_name: initialData?.customer_name || "",
        customer_phone: initialData?.customer_phone || "",
        customer_email: initialData?.customer_email || "",
    });

    // Data states
    const [courts, setCourts] = useState<Court[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [dateOpen, setDateOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        initialData?.date ? new Date(initialData.date) : undefined
    );

    // UI states
    const [loading, setLoading] = useState(true);
    const [bookingType, setBookingType] = useState<"registered" | "guest">(
        "registered"
    );

    // Time slots for selection
    const timeSlots = Array.from({ length: 14 }, (_, i) => {
        const hour = i + 6; // Start from 6 AM
        return `${hour.toString().padStart(2, "0")}:00`;
    });

    // Fetch courts and users
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [courtsResponse, usersResponse] = await Promise.all([
                    fetchApi("/courts", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (courtsResponse.ok) {
                    const courtsData: RawCourtData[] =
                        await courtsResponse.json();
                    const transformedCourts: Court[] = courtsData.map(
                        (court: RawCourtData) => ({
                            court_id: court.court_id,
                            name: court.name,
                            type_name:
                                court.type_name || court.court_type?.name || "",
                            venue_name:
                                court.venue_name || court.venue?.name || "",
                            hourly_rate: court.hourly_rate || 0,
                        })
                    );
                    setCourts(transformedCourts);

                    // Set selected court if provided
                    if (initialData?.court_id) {
                        const court = transformedCourts.find(
                            (c) => c.court_id === initialData.court_id
                        );
                        setSelectedCourt(court || null);
                    }
                }

                if (usersResponse.ok) {
                    const usersData: RawUserData[] = await usersResponse.json();
                    setUsers(
                        usersData.map((user: RawUserData) => ({
                            user_id: user.user_id,
                            username: user.username,
                            email: user.email,
                            fullname: user.fullname || user.name,
                            phone: user.phone,
                        }))
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialData]);

    // Calculate total amount when court or time changes
    useEffect(() => {
        if (selectedCourt && formData.start_time && formData.end_time) {
            const startHour = parseInt(formData.start_time.split(":")[0]);
            const endHour = parseInt(formData.end_time.split(":")[0]);
            const duration = endHour - startHour;

            if (duration > 0) {
                const totalAmount = selectedCourt.hourly_rate * duration;
                setFormData((prev) => ({ ...prev, total_amount: totalAmount }));
            }
        }
    }, [selectedCourt, formData.start_time, formData.end_time]);

    const handleCourtChange = (courtId: string) => {
        const court = courts.find((c) => c.court_id.toString() === courtId);
        setSelectedCourt(court || null);
        setFormData((prev) => ({ ...prev, court_id: parseInt(courtId) }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setDateOpen(false);
        if (date) {
            setFormData((prev) => ({
                ...prev,
                date: format(date, "yyyy-MM-dd"),
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (
            !formData.court_id ||
            !formData.date ||
            !formData.start_time ||
            !formData.end_time
        ) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        if (bookingType === "registered" && !formData.user_id) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }

        if (
            bookingType === "guest" &&
            (!formData.customer_name || !formData.customer_phone)
        ) {
            toast.error("Vui lòng điền tên và số điện thoại khách hàng");
            return;
        }

        // Validate time
        const startTime = formData.start_time;
        const endTime = formData.end_time;
        if (startTime >= endTime) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }

        onSubmit(formData);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông tin khách hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Loại khách hàng</Label>
                        <Select
                            value={bookingType}
                            onValueChange={(value: "registered" | "guest") =>
                                setBookingType(value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="registered">
                                    Khách hàng đã đăng ký
                                </SelectItem>
                                <SelectItem value="guest">
                                    Khách vãng lai
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {bookingType === "registered" ? (
                        <div>
                            <Label htmlFor="user_id">Chọn khách hàng *</Label>
                            <Select
                                value={formData.user_id?.toString() || ""}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        user_id: parseInt(value),
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khách hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.user_id}
                                            value={user.user_id.toString()}
                                        >
                                            {user.fullname || user.username} (
                                            {user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="customer_name">
                                    Tên khách hàng *
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_name: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập tên khách hàng"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_phone">
                                    Số điện thoại *
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={formData.customer_phone || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_phone: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            <div>
                                <Label htmlFor="customer_email">Email</Label>
                                <Input
                                    id="customer_email"
                                    type="email"
                                    value={formData.customer_email || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_email: e.target.value,
                                        }))
                                    }
                                    placeholder="Nhập email"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Court Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Chọn sân
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <Label htmlFor="court_id">Sân thể thao *</Label>
                        <Select
                            value={formData.court_id.toString()}
                            onValueChange={handleCourtChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn sân thể thao" />
                            </SelectTrigger>
                            <SelectContent>
                                {courts.map((court) => (
                                    <SelectItem
                                        key={court.court_id}
                                        value={court.court_id.toString()}
                                    >
                                        {court.name} - {court.type_name} (
                                        {court.venue_name}) -{" "}
                                        {formatCurrency(court.hourly_rate)}/giờ
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedCourt && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">
                                Thông tin sân đã chọn
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600">
                                        Tên sân:
                                    </span>{" "}
                                    {selectedCourt.name}
                                </div>
                                <div>
                                    <span className="text-blue-600">Loại:</span>{" "}
                                    {selectedCourt.type_name}
                                </div>
                                <div>
                                    <span className="text-blue-600">
                                        Địa điểm:
                                    </span>{" "}
                                    {selectedCourt.venue_name}
                                </div>
                                <div>
                                    <span className="text-blue-600">Giá:</span>{" "}
                                    {formatCurrency(selectedCourt.hourly_rate)}
                                    /giờ
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Chọn thời gian
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Ngày đặt sân *</Label>
                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, "dd/MM/yyyy", {
                                            locale: vi,
                                        })
                                    ) : (
                                        <span>Chọn ngày</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    locale={vi}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                            <Select
                                value={formData.start_time}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_time: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giờ bắt đầu" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="end_time">Giờ kết thúc *</Label>
                            <Select
                                value={formData.end_time}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        end_time: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giờ kết thúc" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Info */}
            {formData.total_amount && formData.total_amount > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Thông tin thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center text-lg font-medium">
                                <span>Tổng tiền:</span>
                                <span className="text-green-600">
                                    {formatCurrency(formData.total_amount)}
                                </span>
                            </div>
                            {selectedCourt &&
                                formData.start_time &&
                                formData.end_time && (
                                    <div className="text-sm text-gray-600 mt-2">
                                        {formatCurrency(
                                            selectedCourt.hourly_rate
                                        )}
                                        /giờ ×{" "}
                                        {parseInt(
                                            formData.end_time.split(":")[0]
                                        ) -
                                            parseInt(
                                                formData.start_time.split(
                                                    ":"
                                                )[0]
                                            )}{" "}
                                        giờ
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Ghi chú</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={formData.notes || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                notes: e.target.value,
                            }))
                        }
                        placeholder="Ghi chú thêm cho đặt sân..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                    {submitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Tạo đặt sân
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    disabled={submitting}
                >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                </Button>
            </div>
        </form>
    );
}
