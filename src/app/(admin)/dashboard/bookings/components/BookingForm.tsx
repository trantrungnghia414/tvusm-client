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
import { Badge } from "@/components/ui/badge";
import {
    CalendarIcon,
    Clock,
    User,
    Building2,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    Users,
} from "lucide-react";
import { CreateBookingDto } from "../types/booking";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingFormProps {
    onSubmit: (data: CreateBookingDto) => void;
    submitting?: boolean;
}

interface Court {
    court_id: number;
    name: string;
    type_name: string;
    venue_name: string;
    hourly_rate: number;
    status: string;
}

interface User {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    phone?: string;
}

export default function BookingForm({
    onSubmit,
    submitting = false,
}: BookingFormProps) {
    // Form states
    const [formData, setFormData] = useState<CreateBookingDto>({
        user_id: undefined,
        court_id: 0,
        date: "",
        start_time: "",
        end_time: "",
        notes: "",
        customer_name: "",
        customer_phone: "",
        customer_email: "",
    });

    // Data states
    const [courts, setCourts] = useState<Court[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        undefined
    );
    const [bookingType, setBookingType] = useState<"existing" | "new">(
        "existing"
    );

    // UI states
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const [courtsRes, usersRes] = await Promise.all([
                    fetchApi("/courts", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchApi("/users", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (courtsRes.ok) {
                    const courtsData = await courtsRes.json();
                    setCourts(
                        courtsData.filter(
                            (court: Court) => court.status === "available"
                        )
                    );
                }

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate total amount
    useEffect(() => {
        if (formData.court_id && formData.start_time && formData.end_time) {
            const court = courts.find((c) => c.court_id === formData.court_id);
            if (court) {
                const start = new Date(`2000-01-01 ${formData.start_time}`);
                const end = new Date(`2000-01-01 ${formData.end_time}`);
                const diffHours =
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                if (diffHours > 0) {
                    setTotalAmount(diffHours * court.hourly_rate);
                } else {
                    setTotalAmount(0);
                }
            }
        } else {
            setTotalAmount(0);
        }
    }, [formData.court_id, formData.start_time, formData.end_time, courts]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
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
        if (!formData.court_id) {
            toast.error("Vui lòng chọn sân");
            return;
        }

        if (!formData.date) {
            toast.error("Vui lòng chọn ngày");
            return;
        }

        if (!formData.start_time || !formData.end_time) {
            toast.error("Vui lòng chọn giờ bắt đầu và kết thúc");
            return;
        }

        if (bookingType === "existing" && !formData.user_id) {
            toast.error("Vui lòng chọn khách hàng");
            return;
        }

        if (bookingType === "new") {
            if (!formData.customer_name || !formData.customer_phone) {
                toast.error("Vui lòng nhập tên và số điện thoại khách hàng");
                return;
            }
        }

        // Check time validity
        const start = new Date(`2000-01-01 ${formData.start_time}`);
        const end = new Date(`2000-01-01 ${formData.end_time}`);

        if (end <= start) {
            toast.error("Giờ kết thúc phải sau giờ bắt đầu");
            return;
        }

        const submitData = {
            ...formData,
            total_amount: totalAmount,
        };

        if (bookingType === "existing") {
            delete submitData.customer_name;
            delete submitData.customer_phone;
            delete submitData.customer_email;
        } else {
            delete submitData.user_id;
        }

        onSubmit(submitData);
    };

    const selectedCourt = courts.find(
        (court) => court.court_id === formData.court_id
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Loại đặt sân
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant={
                                bookingType === "existing"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() => setBookingType("existing")}
                            className="h-16 flex flex-col gap-1"
                        >
                            <User className="h-5 w-5" />
                            <span>Khách hàng có sẵn</span>
                        </Button>
                        <Button
                            type="button"
                            variant={
                                bookingType === "new" ? "default" : "outline"
                            }
                            onClick={() => setBookingType("new")}
                            className="h-16 flex flex-col gap-1"
                        >
                            <Users className="h-5 w-5" />
                            <span>Khách hàng mới</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Thông tin khách hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bookingType === "existing" ? (
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
                                    <SelectValue placeholder="Tìm và chọn khách hàng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.user_id}
                                            value={user.user_id.toString()}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {user.fullname ||
                                                        user.username}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {user.email}{" "}
                                                    {user.phone &&
                                                        `• ${user.phone}`}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="md:col-span-2">
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
                                    placeholder="Nhập email (tùy chọn)"
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
                        <Building2 className="h-5 w-5" />
                        Chọn sân
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <Label htmlFor="court_id">Sân thể thao *</Label>
                        <Select
                            value={formData.court_id?.toString() || ""}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    court_id: parseInt(value),
                                }))
                            }
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
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {court.name}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {court.type_name} •{" "}
                                                {court.venue_name} •{" "}
                                                {court.hourly_rate.toLocaleString(
                                                    "vi-VN"
                                                )}
                                                đ/giờ
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedCourt && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-blue-900">
                                            {selectedCourt.name}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {selectedCourt.type_name} •{" "}
                                            {selectedCourt.venue_name}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800"
                                    >
                                        {selectedCourt.hourly_rate.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ/giờ
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Thời gian đặt sân
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Date Selection */}
                    <div>
                        <Label>Ngày đặt sân *</Label>
                        <Popover>
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

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_time">Giờ bắt đầu *</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_time: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_time">Giờ kết thúc *</Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        end_time: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {/* Duration & Cost Preview */}
                    {formData.start_time &&
                        formData.end_time &&
                        totalAmount > 0 && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="font-medium text-green-900">
                                            Thời lượng:{" "}
                                            {(
                                                (new Date(
                                                    `2000-01-01 ${formData.end_time}`
                                                ).getTime() -
                                                    new Date(
                                                        `2000-01-01 ${formData.start_time}`
                                                    ).getTime()) /
                                                (1000 * 60 * 60)
                                            ).toFixed(1)}{" "}
                                            giờ
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                        <span className="font-bold text-green-900 text-lg">
                                            {totalAmount.toLocaleString(
                                                "vi-VN"
                                            )}
                                            đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                </CardContent>
            </Card>

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
                        placeholder="Nhập ghi chú cho đặt sân (tùy chọn)"
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                    <p className="font-medium">Lưu ý quan trọng:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>
                            Vui lòng kiểm tra kỹ thông tin trước khi tạo đặt sân
                        </li>
                        <li>
                            Đặt sân sẽ được tạo với trạng thái &quot;Chờ xác nhận&quot;
                        </li>
                        <li>
                            Khách hàng sẽ nhận được thông báo qua email (nếu có)
                        </li>
                    </ul>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex-1"
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    disabled={submitting || totalAmount <= 0}
                    className="flex-1"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Tạo đặt sân
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
