"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import { Event } from "../types/eventTypes";

interface Venue {
    venue_id: number;
    name: string;
}

interface Court {
    court_id: number;
    name: string;
    venue_id: number;
}

interface EventFormProps {
    event?: Event; // Sự kiện đã có (khi chỉnh sửa)
    onSubmit: (formData: FormData) => void;
    isSubmitting?: boolean;
}

export default function EventForm({
    event,
    onSubmit,
    isSubmitting = false,
}: EventFormProps) {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string>(
        event?.venue_id.toString() || ""
    );
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        event?.image || null
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        event?.start_date ? new Date(event.start_date) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        event?.end_date ? new Date(event.end_date) : undefined
    );
    const [hasEndDate, setHasEndDate] = useState<boolean>(!!event?.end_date);
    const [hasTimeRange, setHasTimeRange] = useState<boolean>(
        !!(event?.start_time && event?.end_time)
    );

    // Fetch danh sách venues và courts
    useEffect(() => {
        const fetchVenuesAndCourts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    return;
                }

                // Fetch venues
                const venuesResponse = await fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (venuesResponse.ok) {
                    const venuesData = await venuesResponse.json();
                    setVenues(venuesData);
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
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchVenuesAndCourts();
    }, [selectedVenueId]);

    // Lọc court khi thay đổi venue
    useEffect(() => {
        if (selectedVenueId) {
            const filtered = courts.filter(
                (court) => court.venue_id.toString() === selectedVenueId
            );
            setFilteredCourts(filtered);
        } else {
            setFilteredCourts([]);
        }
    }, [selectedVenueId, courts]);

    // Xử lý khi chọn file ảnh
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Convert dates to string format
        if (startDate) {
            formData.set("startDate", format(startDate, "yyyy-MM-dd"));
        }

        if (hasEndDate && endDate) {
            formData.set("endDate", format(endDate, "yyyy-MM-dd"));
        } else {
            formData.delete("endDate");
        }

        if (!hasTimeRange) {
            formData.delete("startTime");
            formData.delete("endTime");
        }

        // Handle image
        if (selectedImage) {
            formData.set("image", selectedImage);
        } else if (event?.image && !previewUrl) {
            // Image was deleted
            formData.set("image", "");
        } else if (event?.image && previewUrl === event.image) {
            // Image wasn't changed
            formData.delete("image");
        }

        // Handle checkboxes and switches
        formData.set(
            "isPublic",
            formData.get("isPublic") === "on" ? "true" : "false"
        );
        formData.set(
            "isFeatured",
            formData.get("isFeatured") === "on" ? "true" : "false"
        );

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6 md:col-span-2">
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

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base">
                            Mô tả
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Nhập mô tả sự kiện"
                            defaultValue={event?.description || ""}
                            className="min-h-32"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="eventType" className="text-base">
                            Loại sự kiện <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            name="eventType"
                            defaultValue={event?.event_type || ""}
                            required
                        >
                            <SelectTrigger id="eventType">
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

                    <div className="space-y-2">
                        <Label htmlFor="venueId" className="text-base">
                            Địa điểm <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            name="venueId"
                            defaultValue={event?.venue_id.toString() || ""}
                            onValueChange={setSelectedVenueId}
                            required
                        >
                            <SelectTrigger id="venueId">
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

                    <div className="space-y-2">
                        <Label htmlFor="courtId" className="text-base">
                            Sân
                        </Label>
                        <Select
                            name="courtId"
                            defaultValue={event?.court_id?.toString() || ""}
                            disabled={
                                !selectedVenueId || filteredCourts.length === 0
                            }
                        >
                            <SelectTrigger id="courtId">
                                <SelectValue placeholder="Chọn sân (không bắt buộc)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">
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

                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-base">
                            Ngày bắt đầu <span className="text-red-500">*</span>
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
                                        onSelect={setStartDate}
                                    />
                                </PopoverContent>
                            </Popover>
                            <input
                                type="hidden"
                                name="startDate"
                                value={
                                    startDate
                                        ? format(startDate, "yyyy-MM-dd")
                                        : ""
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="hasEndDate"
                            checked={hasEndDate}
                            onCheckedChange={(checked) =>
                                setHasEndDate(!!checked)
                            }
                        />
                        <Label htmlFor="hasEndDate">Có ngày kết thúc</Label>
                    </div>

                    {hasEndDate && (
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-base">
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
                                                startDate
                                                    ? date < startDate
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                                <input
                                    type="hidden"
                                    name="endDate"
                                    value={
                                        endDate
                                            ? format(endDate, "yyyy-MM-dd")
                                            : ""
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>

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
                                    htmlFor="startTime"
                                    className="text-base"
                                >
                                    Giờ bắt đầu
                                </Label>
                                <Input
                                    id="startTime"
                                    name="startTime"
                                    type="time"
                                    defaultValue={
                                        event?.start_time?.substring(0, 5) || ""
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime" className="text-base">
                                    Giờ kết thúc
                                </Label>
                                <Input
                                    id="endTime"
                                    name="endTime"
                                    type="time"
                                    defaultValue={
                                        event?.end_time?.substring(0, 5) || ""
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="maxParticipants"
                                className="text-base"
                            >
                                Số người tham gia tối đa
                            </Label>
                            <Input
                                id="maxParticipants"
                                name="maxParticipants"
                                type="number"
                                min="1"
                                placeholder="Không giới hạn"
                                defaultValue={event?.max_participants || ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="registrationDeadline"
                                className="text-base"
                            >
                                Hạn đăng ký
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal w-full",
                                            !event?.registration_deadline &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {event?.registration_deadline ? (
                                            format(
                                                new Date(
                                                    event.registration_deadline
                                                ),
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
                                        selected={
                                            event?.registration_deadline
                                                ? new Date(
                                                      event.registration_deadline
                                                  )
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            const input =
                                                document.querySelector(
                                                    '[name="registrationDeadline"]'
                                                ) as HTMLInputElement;
                                            if (input && date) {
                                                input.value = format(
                                                    date,
                                                    "yyyy-MM-dd"
                                                );
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <input
                                type="hidden"
                                name="registrationDeadline"
                                defaultValue={
                                    event?.registration_deadline || ""
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-base">
                            Hình ảnh sự kiện
                        </Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="image"
                                name="image_file"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        document
                                            .getElementById("image")
                                            ?.click()
                                    }
                                    className="w-full"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    {selectedImage
                                        ? selectedImage.name
                                        : previewUrl
                                        ? "Thay đổi hình ảnh"
                                        : "Chọn hình ảnh"}
                                </Button>
                            </div>

                            {(previewUrl || selectedImage) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setPreviewUrl(null);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                        {previewUrl && (
                            <div className="mt-2 relative h-40 rounded-md overflow-hidden border">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="isPublic"
                                name="isPublic"
                                defaultChecked={event?.is_public !== false}
                            />
                            <Label htmlFor="isPublic" className="text-base">
                                Hiển thị công khai
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isFeatured"
                                name="isFeatured"
                                defaultChecked={event?.is_featured === true}
                            />
                            <Label htmlFor="isFeatured" className="text-base">
                                Sự kiện nổi bật
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/events")}
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Đang lưu..."
                        : event
                        ? "Cập nhật"
                        : "Tạo sự kiện"}
                </Button>
            </div>
        </form>
    );
}
