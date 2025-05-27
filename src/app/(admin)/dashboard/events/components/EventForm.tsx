"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import { Globe, EyeOff, Star, StarOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Event } from "../types/eventTypes";

interface Venue {
    venue_id: number;
    name: string;
}

interface Court {
    court_id: number;
    name: string;
    code?: string;
    venue_id: number;
}

interface EventFormProps {
    event?: Event;
    onSubmit: (formData: FormData) => Promise<void>;
    isSubmitting?: boolean;
}

export default function EventForm({
    event,
    onSubmit,
    isSubmitting = false,
}: EventFormProps) {
    // State
    const [registrationDeadline, setRegistrationDeadline] = useState<
        Date | undefined
    >(
        event?.registration_deadline
            ? new Date(event.registration_deadline)
            : undefined
    );
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>(
        event?.venue_id?.toString() || ""
    );
    const [selectedCourtId, setSelectedCourtId] = useState<string>(
        event?.court_id?.toString() || "none"
    );
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        event?.image ? getImageUrl(event.image) : null
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        event?.start_date ? new Date(event.start_date) : new Date()
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        event?.end_date ? new Date(event.end_date) : undefined
    );
    const [hasTimeRange, setHasTimeRange] = useState<boolean>(
        !!(event?.start_time && event?.end_time)
    );
    // Tạo một state để theo dõi trạng thái checkbox hủy
    const [cancelEvent, setCancelEvent] = useState<boolean>(false);

    // Thêm state cho is_public và is_featured với giá trị mặc định là true
    const [isPublic, setIsPublic] = useState<number>(event?.is_public ?? 1);
    const [isFeatured, setIsFeatured] = useState<number>(
        event?.is_featured ?? 1
    );

    // Thêm state để kiểm tra lỗi
    const [formErrors, setFormErrors] = useState({
        title: false,
        eventType: false,
        venueId: false,
        startDate: false,
        registrationDeadline: false,
        organizerName: false,
        hasValidTime: true,
    });

    // Fetch venues và courts
    const fetchVenuesAndCourts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            // Fetch venues
            const venuesResponse = await fetchApi("/venues", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (venuesResponse.ok) {
                const venuesData = await venuesResponse.json();
                setVenues(venuesData);
            } else {
                throw new Error("Không thể tải danh sách địa điểm");
            }

            // Fetch courts
            const courtsResponse = await fetchApi("/courts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (courtsResponse.ok) {
                const courtsData = await courtsResponse.json();
                setCourts(courtsData);

                // Nếu đã chọn venue (khi edit), lọc danh sách courts
                if (selectedVenueId) {
                    const filtered = courtsData.filter(
                        (court: Court) =>
                            court.venue_id.toString() === selectedVenueId
                    );
                    setFilteredCourts(filtered);
                }
            } else {
                throw new Error("Không thể tải danh sách sân");
            }
        } catch (error) {
            console.error("Error fetching venues and courts:", error);
            toast.error("Không thể tải danh sách địa điểm và sân");
        }
    }, [router, selectedVenueId]);

    useEffect(() => {
        fetchVenuesAndCourts();
    }, [fetchVenuesAndCourts]);

    // Lọc court khi thay đổi venue
    useEffect(() => {
        if (selectedVenueId) {
            const filtered = courts.filter(
                (court) => court.venue_id.toString() === selectedVenueId
            );
            setFilteredCourts(filtered);
            // Đặt lại court_id nếu không còn trong venue mới
            if (
                selectedCourtId !== "none" &&
                !filtered.some(
                    (court) => court.court_id.toString() === selectedCourtId
                )
            ) {
                setSelectedCourtId("none");
            }
        } else {
            setFilteredCourts([]);
            setSelectedCourtId("none");
        }
    }, [courts, selectedVenueId, selectedCourtId]);

    // Helper function to get image URL
    function getImageUrl(path: string | null) {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        return `http://localhost:3000${path}`;
    }

    // Xử lý khi chọn file ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB");
                return;
            }

            // Kiểm tra định dạng file
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
            ];
            if (!validTypes.includes(file.type)) {
                toast.error(
                    "Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF"
                );
                return;
            }

            setSelectedImage(file);

            // Tạo URL để xem trước ảnh
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewUrl(e.target.result.toString());
                }
            };
            fileReader.readAsDataURL(file);
        }
    };

    // Cập nhật hàm handleSubmit để sửa lỗi kiểm tra
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Log trước khi set giá trị
        console.log("Current state values:", {
            isPublic,
            isFeatured,
        });

        // Log kiểm tra giá trị và kiểu dữ liệu trước khi gửi
        const isPublicValue = formData.get("is_public");
        console.log("Client side - is_public value:", isPublicValue);
        console.log("Client side - is_public type:", typeof isPublicValue);

        // Reset form errors
        setFormErrors({
            title: false,
            eventType: false,
            venueId: false,
            startDate: false,
            registrationDeadline: false,
            organizerName: false,
            hasValidTime: true,
        });

        // Validate title
        const title = formData.get("title")?.toString().trim();
        if (!title) {
            setFormErrors((prev) => ({ ...prev, title: true }));
            toast.error("Vui lòng nhập tên sự kiện");
            return;
        }

        // Validate event type
        const eventType = formData.get("event_type")?.toString();
        if (!eventType) {
            setFormErrors((prev) => ({ ...prev, eventType: true }));
            toast.error("Vui lòng chọn loại sự kiện");
            return;
        }

        // Kiểm tra địa điểm
        const venueId = formData.get("venue_id")?.toString();
        if (!venueId) {
            toast.error("Vui lòng chọn địa điểm");
            return;
        }

        // Kiểm tra ngày bắt đầu
        const startDateValue = formData.get("start_date")?.toString();
        if (!startDateValue) {
            toast.error("Vui lòng chọn ngày bắt đầu");
            return;
        }

        // Kiểm tra ngày kết thúc
        const endDateValue = formData.get("end_date")?.toString();
        if (!endDateValue) {
            toast.error("Vui lòng chọn ngày kết thúc");
            return;
        }

        // Kiểm tra hạn đăng ký
        const registrationDeadlineValue = formData
            .get("registration_deadline")
            ?.toString();
        if (!registrationDeadlineValue) {
            toast.error("Vui lòng chọn hạn đăng ký");
            return;
        }

        // Kiểm tra người/đơn vị tổ chức
        const organizerName = formData.get("organizer_name")?.toString().trim();
        if (!organizerName) {
            toast.error("Vui lòng nhập người/đơn vị tổ chức");
            return;
        }

        // Kiểm tra giờ nếu có chọn khung giờ
        if (hasTimeRange) {
            const startTime = formData.get("start_time")?.toString();
            const endTime = formData.get("end_time")?.toString();

            if (!startTime || startTime.trim() === "") {
                toast.error("Vui lòng nhập giờ bắt đầu");
                return;
            }

            if (!endTime || endTime.trim() === "") {
                toast.error("Vui lòng nhập giờ kết thúc");
                return;
            }
        } else {
            // Nếu không có khung giờ, xóa các trường liên quan
            formData.delete("start_time");
            formData.delete("end_time");
        }

        // Kiểm tra ngày bắt đầu và kết thúc
        if (startDate && endDate && endDate < startDate) {
            toast.error("Ngày kết thúc phải sau ngày bắt đầu");
            return;
        }

        // XỬ LÝ CÁC TRƯỜNG CÓ THỂ GÂY LỖI

        // Xử lý court_id
        const courtId = formData.get("court_id");
        if (courtId === "none" || courtId === "") {
            formData.delete("court_id");
        }

        // Kiểm tra registration_deadline - xóa nếu không có giá trị
        const registrationDeadline = formData.get("registration_deadline");
        if (!registrationDeadline || registrationDeadline === "") {
            formData.delete("registration_deadline");
        }

        // Xử lý max_participants - đảm bảo là số nguyên hợp lệ
        const maxParticipants = formData.get("max_participants");
        if (!maxParticipants || maxParticipants === "") {
            formData.set("max_participants", "9999");
            // formData.delete("max_participants");
        } else {
            const maxParticipantsNum = parseInt(maxParticipants.toString());
            if (isNaN(maxParticipantsNum) || maxParticipantsNum <= 0) {
                formData.set("max_participants", "9999");
            }
        }

        // Thêm file ảnh đã chọn vào FormData (nếu có)
        if (selectedImage) {
            formData.set("image", selectedImage);
        }

        // Xử lý các trường boolean
        // formData.set("is_public", String(isPublic)); // "true" hoặc "false"
        // formData.set("is_featured", String(isFeatured)); // "true" hoặc "false"

        formData.set("is_public", isPublic.toString());
        formData.set("is_featured", isFeatured.toString());

        // Log để kiểm tra giá trị cuối
        console.log("Final form values:", {
            is_public: formData.get("is_public"),
            is_featured: formData.get("is_featured"),
        });

        // Xử lý trạng thái
        if (event && cancelEvent) {
            formData.set("status", "cancelled");
        } else if (!event) {
            formData.set("status", "upcoming");
        } else {
            formData.delete("status");
        }

        // Gọi onSubmit callback với formData đã kiểm tra
        try {
            console.log("Form data being sent:", {
                title: formData.get("title"),
                event_type: formData.get("event_type"),
                venue_id: formData.get("venue_id"),
                start_date: formData.get("start_date"),
                end_date: formData.get("end_date"),
                court_id: formData.get("court_id"),
                max_participants: formData.get("max_participants"),
                registration_deadline: formData.get("registration_deadline"),
                status: formData.get("status"),
                is_public: formData.get("is_public"),
                is_featured: formData.get("is_featured"),
            });

            // Xóa các trường cũ nếu có
            // formData.delete("is_public");
            // formData.delete("is_featured");

            formData.set("is_public", isPublic.toString()); // "0" hoặc "1"
            formData.set("is_featured", isFeatured.toString()); // "0" hoặc "1"

            // Thêm giá trị mới dưới dạng số 0/1
            // formData.append("is_public", isPublic.toString());
            // formData.append("is_featured", isFeatured.toString());

            // Thêm log sau khi append các giá trị mới
            console.log("Final form data being sent:", {
                is_public: formData.get("is_public"),
                is_featured: formData.get("is_featured"),
                // Log thêm state để debug
                isPublicState: isPublic,
                isFeaturedState: isFeatured,
            });

            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Có lỗi xảy ra khi gửi biểu mẫu");
        }
    };

    // Thêm hàm xử lý khi checkbox thay đổi
    const handleCancelEventChange = (checked: boolean | string) => {
        setCancelEvent(!!checked);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phần nội dung chính */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái */}
                <div className="space-y-6">
                    {/* Tên sự kiện */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-base">
                            Tên sự kiện <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="Nhập tên sự kiện"
                            defaultValue={event?.title || ""}
                            className={formErrors.title ? "border-red-500" : ""}
                            required
                        />
                        {formErrors.title && (
                            <p className="text-sm text-red-500">
                                Vui lòng nhập tên sự kiện
                            </p>
                        )}
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base">
                            Mô tả
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Nhập mô tả chi tiết về sự kiện"
                            className="min-h-[80px]"
                            rows={3}
                            defaultValue={event?.description || ""}
                        />
                    </div>

                    {/* Loại sự kiện */}
                    <div className="space-y-2">
                        <Label htmlFor="event_type" className="text-base">
                            Loại sự kiện <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            name="event_type"
                            defaultValue={event?.event_type || ""}
                            required
                        >
                            <SelectTrigger
                                className={
                                    formErrors.eventType ? "border-red-500" : ""
                                }
                            >
                                <SelectValue placeholder="Chọn loại sự kiện" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="competition">
                                    Thi đấu
                                </SelectItem>
                                <SelectItem value="training">
                                    Tập luyện
                                </SelectItem>
                                <SelectItem value="friendly">
                                    Giao lưu
                                </SelectItem>
                                <SelectItem value="school_event">
                                    Sự kiện trường
                                </SelectItem>
                                <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                        {formErrors.eventType && (
                            <p className="text-sm text-red-500">
                                Vui lòng chọn loại sự kiện
                            </p>
                        )}
                    </div>

                    {/* Địa điểm và sân */}
                    <div className="space-y-4">
                        {/* Địa điểm */}
                        <div className="space-y-2">
                            <Label htmlFor="venue_id" className="text-base">
                                Địa điểm <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                name="venue_id"
                                value={selectedVenueId}
                                onValueChange={(value) => {
                                    setSelectedVenueId(value);
                                }}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {venues.map((venue) => (
                                        <SelectItem
                                            key={venue.venue_id}
                                            value={venue.venue_id.toString()}
                                        >
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sân (nếu có) */}
                        {selectedVenueId && (
                            <div className="space-y-2">
                                <Label htmlFor="court_id" className="text-base">
                                    Sân <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    name="court_id"
                                    value={selectedCourtId}
                                    onValueChange={setSelectedCourtId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn sân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Không chọn sân cụ thể
                                        </SelectItem>
                                        {filteredCourts.map((court) => (
                                            <SelectItem
                                                key={court.court_id}
                                                value={court.court_id.toString()}
                                            >
                                                {court.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột phải */}
                <div className="space-y-6">
                    {/* Ngày bắt đầu và kết thúc */}
                    <div className="space-y-4">
                        {/* Ngày bắt đầu */}
                        <div className="space-y-2">
                            <Label htmlFor="start_date" className="text-base">
                                Ngày bắt đầu{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal w-full",
                                                !startDate &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? (
                                                format(startDate, "dd/MM/yyyy")
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={(date) => {
                                                setStartDate(date);
                                                // Nếu ngày kết thúc trước ngày bắt đầu mới, reset ngày kết thúc
                                                if (
                                                    date &&
                                                    endDate &&
                                                    date > endDate
                                                ) {
                                                    setEndDate(undefined);
                                                }
                                            }}
                                            disabled={(date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <input
                                    type="hidden"
                                    name="start_date"
                                    value={
                                        startDate
                                            ? format(startDate, "yyyy-MM-dd")
                                            : ""
                                    }
                                />
                            </div>
                        </div>

                        {/* Ngày kết thúc - hiển thị luôn thay vì dùng checkbox */}
                        <div className="space-y-2">
                            <Label htmlFor="end_date" className="text-base">
                                Ngày kết thúc
                            </Label>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal w-full",
                                                !endDate &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? (
                                                format(endDate, "dd/MM/yyyy")
                                            ) : (
                                                <span>Chọn ngày</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) =>
                                                // Disable ngày trước bắt đầu hoặc hôm nay nếu chưa chọn ngày bắt đầu
                                                startDate
                                                    ? date < startDate
                                                    : date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <input
                                    type="hidden"
                                    name="end_date"
                                    value={
                                        endDate
                                            ? format(endDate, "yyyy-MM-dd")
                                            : ""
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Khung giờ */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasTimeRange"
                                checked={hasTimeRange}
                                onCheckedChange={(checked) =>
                                    setHasTimeRange(!!checked)
                                }
                            />
                            <Label htmlFor="hasTimeRange">
                                Có khung giờ cụ thể
                            </Label>
                        </div>

                        {hasTimeRange && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="start_time"
                                        className="text-base"
                                    >
                                        Giờ bắt đầu
                                    </Label>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="start_time"
                                            name="start_time"
                                            type="time"
                                            defaultValue={
                                                event?.start_time || ""
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="end_time"
                                        className="text-base"
                                    >
                                        Giờ kết thúc
                                    </Label>
                                    <div className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="end_time"
                                            name="end_time"
                                            type="time"
                                            defaultValue={event?.end_time || ""}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Số người tham gia tối đa */}
                    <div className="space-y-2">
                        <Label htmlFor="max_participants" className="text-base">
                            Số người tham gia tối đa
                        </Label>
                        <Input
                            id="max_participants"
                            name="max_participants"
                            type="number"
                            min="1"
                            placeholder="Không giới hạn"
                            defaultValue={event?.max_participants || ""}
                        />
                    </div>

                    {/* Hạn đăng ký */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="registration_deadline"
                            className="text-base"
                        >
                            Hạn đăng ký <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal w-full",
                                            !registrationDeadline &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {registrationDeadline ? (
                                            format(
                                                registrationDeadline,
                                                "dd/MM/yyyy"
                                            )
                                        ) : (
                                            <span>Chọn ngày</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={registrationDeadline}
                                        onSelect={setRegistrationDeadline}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <input
                                type="hidden"
                                name="registration_deadline"
                                value={
                                    registrationDeadline
                                        ? format(
                                              registrationDeadline,
                                              "yyyy-MM-dd"
                                          )
                                        : ""
                                }
                            />
                        </div>
                    </div>

                    {/* Người/Đơn vị tổ chức */}
                    <div className="space-y-2">
                        <Label htmlFor="organizer_name" className="text-base">
                            Người/Đơn vị tổ chức{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="organizer_name"
                            name="organizer_name"
                            placeholder="Nhập tên người/đơn vị tổ chức sự kiện"
                            defaultValue={event?.organizer_name || ""}
                        />
                    </div>
                </div>
            </div>

            {/* Hình ảnh và cài đặt khác */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Hình ảnh */}
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-base">
                            Hình ảnh
                        </Label>
                        <div className="flex flex-col gap-4">
                            <Input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {previewUrl && (
                                <div className="relative w-full h-40 rounded-md overflow-hidden">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Các cài đặt khác */}
                    <div className="space-y-4">
                        <h3 className="text-base font-medium">Cài đặt khác</h3>

                        {/* Trạng thái */}
                        {event ? (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="status"
                                    className="text-base flex items-center"
                                >
                                    Trạng thái
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Tự động dựa trên thời gian, chỉ có thể
                                        hủy)
                                    </span>
                                </Label>

                                {/* Nếu sự kiện chưa hủy, hiển thị checkbox để hủy */}
                                {event.status !== "cancelled" ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="p-2 bg-gray-50 border rounded-md">
                                            {event.status === "upcoming" &&
                                                "Sắp diễn ra"}
                                            {event.status === "ongoing" &&
                                                "Đang diễn ra"}
                                            {event.status === "completed" &&
                                                "Đã hoàn thành"}
                                        </div>

                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="cancel_event"
                                                name="cancel_event"
                                                checked={cancelEvent}
                                                onCheckedChange={
                                                    handleCancelEventChange
                                                }
                                            />
                                            <Label
                                                htmlFor="cancel_event"
                                                className="text-red-600 font-medium"
                                            >
                                                Hủy sự kiện này
                                            </Label>
                                            <input
                                                type="hidden"
                                                name="status"
                                                value={
                                                    cancelEvent
                                                        ? "cancelled"
                                                        : event.status
                                                }
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-red-50 text-red-800 border border-red-200 rounded-md">
                                        Sự kiện đã bị hủy
                                        <input
                                            type="hidden"
                                            name="status"
                                            value="cancelled"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Khi tạo mới, không hiển thị trường chọn trạng thái
                            <input
                                type="hidden"
                                name="status"
                                value="upcoming"
                            />
                        )}

                        {/* Trạng thái công khai */}
                        <div className="space-y-2">
                            <Label>Trạng thái công khai</Label>
                            <Select
                                value={isPublic === 1 ? "1" : "0"}
                                onValueChange={(value) => {
                                    console.log(
                                        "Selected isPublic value:",
                                        value
                                    );
                                    setIsPublic(Number(value));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="1"
                                        className="flex items-center"
                                    >
                                        <Globe className="mr-2 h-4 w-4" />
                                        <span>Công khai</span>
                                    </SelectItem>
                                    <SelectItem
                                        value="0"
                                        className="flex items-center"
                                    >
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        <span>Không công khai</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hiển thị nổi bật */}
                        <div className="space-y-2">
                            <Label>Hiển thị nổi bật</Label>
                            <Select
                                value={isFeatured === 1 ? "1" : "0"}
                                onValueChange={(value) =>
                                    setIsFeatured(Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="1"
                                        className="flex items-center"
                                    >
                                        <Star className="mr-2 h-4 w-4" />
                                        <span>Nổi bật</span>
                                    </SelectItem>
                                    <SelectItem
                                        value="0"
                                        className="flex items-center"
                                    >
                                        <StarOff className="mr-2 h-4 w-4" />
                                        <span>Không nổi bật</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nút lưu */}
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {event ? "Cập nhật" : "Tạo sự kiện"}
                </Button>
            </div>
        </form>
    );
}
