"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import Image from "next/image";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);

        try {
            // Kiểm tra các trường bắt buộc
            if (!formData.get("title")) {
                throw new Error("Vui lòng nhập tên sự kiện");
            }

            if (!formData.get("event_type")) {
                throw new Error("Vui lòng chọn loại sự kiện");
            }

            if (!formData.get("venue_id")) {
                throw new Error("Vui lòng chọn địa điểm");
            }

            // Convert dates to string format
            if (startDate) {
                formData.set("start_date", format(startDate, "yyyy-MM-dd"));
            } else {
                throw new Error("Vui lòng chọn ngày bắt đầu");
            }

            if (endDate) {
                formData.set("end_date", format(endDate, "yyyy-MM-dd"));
            } else {
                formData.delete("end_date");
            }

            if (registrationDeadline) {
                formData.set(
                    "registration_deadline",
                    format(registrationDeadline, "yyyy-MM-dd")
                );
            } else {
                formData.delete("registration_deadline");
            }

            // Xử lý giá trị court_id
            const courtId = formData.get("court_id");
            if (courtId === "none" || !courtId) {
                formData.delete("court_id");
            }

            // Xử lý thời gian nếu có
            if (hasTimeRange) {
                const startTime = formData.get("start_time");
                const endTime = formData.get("end_time");

                if (!startTime) {
                    formData.delete("start_time");
                }

                if (!endTime) {
                    formData.delete("end_time");
                }
            } else {
                formData.delete("start_time");
                formData.delete("end_time");
            }

            // Xử lý Boolean values
            formData.set(
                "is_public",
                formData.get("is_public") === "on" ? "true" : "false"
            );
            formData.set(
                "is_featured",
                formData.get("is_featured") === "on" ? "true" : "false"
            );

            // Xử lý file ảnh
            if (selectedImage) {
                formData.set("image", selectedImage);
            } else {
                formData.delete("image");
            }

            // Log ra để debug
            console.log("Form data to be sent:", {
                title: formData.get("title"),
                start_date: formData.get("start_date"),
                end_date: formData.get("end_date"),
                event_type: formData.get("event_type"),
                venue_id: formData.get("venue_id"),
                court_id: formData.get("court_id"),
                is_public: formData.get("is_public"),
                is_featured: formData.get("is_featured"),
            });

            // Submit form
            onSubmit(formData);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra khi submit form"
            );
        }
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
                            required
                        />
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
                            <SelectTrigger>
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
                                    Sân
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

                    {/* Người/Đơn vị tổ chức */}
                    {/* <div className="space-y-2">
                        <Label htmlFor="organizer_name" className="text-base">
                            Người/Đơn vị tổ chức
                        </Label>
                        <Input
                            id="organizer_name"
                            name="organizer_name"
                            placeholder="Nhập tên người/đơn vị tổ chức sự kiện"
                            defaultValue={event?.organizer_name || ""}
                        />
                    </div> */}
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
                            Hạn đăng ký
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
                            Người/Đơn vị tổ chức
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
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-base">
                                Trạng thái
                            </Label>
                            <Select
                                name="status"
                                defaultValue={event?.status || "upcoming"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="upcoming">
                                        Sắp diễn ra
                                    </SelectItem>
                                    <SelectItem value="ongoing">
                                        Đang diễn ra
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Đã hoàn thành
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Đã hủy
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Công khai */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_public"
                                name="is_public"
                                defaultChecked={
                                    event?.is_public === undefined
                                        ? true
                                        : event.is_public
                                }
                            />
                            <Label htmlFor="is_public">
                                Công khai (hiển thị cho người dùng)
                            </Label>
                        </div>

                        {/* Nổi bật */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_featured"
                                name="is_featured"
                                defaultChecked={event?.is_featured}
                            />
                            <Label htmlFor="is_featured">
                                Nổi bật (hiển thị ở trang chủ)
                            </Label>
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
