// client/src/app/(admin)/dashboard/feedbacks/add/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Loader2,
    User,
    Star,
    Search,
    Building,
    Calendar,
    Plus,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DashboardLayout from "../../components/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CreateFeedbackDto, VenueOption } from "../types/feedback";
import { fetchApi } from "@/lib/api";

// ✅ Cập nhật interface UserOption để có đủ properties
interface UserOption {
    user_id: number;
    username: string;
    email: string;
    fullname?: string;
    role: string;
    avatar?: string;
}

interface Court {
    court_id: number;
    name: string;
    venue_id: number;
}

interface Booking {
    booking_id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    court_name: string;
    venue_name: string;
}

export default function AddFeedbackPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<CreateFeedbackDto>({
        user_id: 0,
        rating: 5,
        comment: "",
        venue_id: undefined,
        court_id: undefined,
        booking_id: undefined,
    });

    const [users, setUsers] = useState<UserOption[]>([]);
    const [venues, setVenues] = useState<VenueOption[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

    const [userSearch, setUserSearch] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch initial data
    const fetchInitialData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const [usersRes, venuesRes] = await Promise.all([
                fetchApi("/users", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetchApi("/venues", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(
                    usersData.filter(
                        (user: UserOption) =>
                            user.role === "customer" || user.role === "user"
                    )
                );
            }

            if (venuesRes.ok) {
                const venuesData = await venuesRes.json();
                setVenues(venuesData);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Fetch courts when venue changes
    const fetchCourts = useCallback(async (venueId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi(`/venues/${venueId}/courts`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const courtsData = await response.json();
                setCourts(courtsData);
            }
        } catch (error) {
            console.error("Error fetching courts:", error);
        }
    }, []);

    // Fetch user bookings
    const fetchUserBookings = useCallback(async (userId: number) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await fetchApi(`/bookings/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const bookingsData = await response.json();
                setBookings(bookingsData);
            }
        } catch (error) {
            console.error("Error fetching user bookings:", error);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (formData.venue_id) {
            fetchCourts(formData.venue_id);
        } else {
            setCourts([]);
        }
    }, [formData.venue_id, fetchCourts]);

    useEffect(() => {
        if (formData.user_id) {
            fetchUserBookings(formData.user_id);
        } else {
            setBookings([]);
        }
    }, [formData.user_id, fetchUserBookings]);

    // ✅ Sửa getImageUrl để trả về undefined thay vì null
    const getImageUrl = (path?: string) => {
        if (!path) return undefined;
        if (path.startsWith("http")) return path;
        return `http://localhost:3000${path}`;
    };

    const getInitials = (name?: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Filter users based on search
    const filteredUsers = users.filter(
        (user) =>
            user.fullname?.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.user_id) {
            newErrors.user_id = "Vui lòng chọn người dùng";
        }

        if (!formData.comment.trim()) {
            newErrors.comment = "Vui lòng nhập nội dung phản hồi";
        }

        if (formData.comment.length > 1000) {
            newErrors.comment = "Nội dung không được vượt quá 1000 ký tự";
        }

        if (formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = "Đánh giá phải từ 1 đến 5 sao";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            const response = await fetchApi("/feedbacks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    venue_id: formData.venue_id || undefined,
                    court_id: formData.court_id || undefined,
                    booking_id: formData.booking_id || undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Không thể tạo phản hồi");
            }

            const newFeedback = await response.json();
            toast.success("Tạo phản hồi thành công");
            router.push(`/dashboard/feedbacks/${newFeedback.feedback_id}`);
        } catch (error) {
            console.error("Error creating feedback:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể tạo phản hồi"
            );
        } finally {
            setSaving(false);
        }
    };

    // ✅ Sửa handleInputChange để thay thế any bằng union type
    const handleInputChange = (
        field: keyof CreateFeedbackDto,
        value: string | number | undefined
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }

        // Reset dependent fields
        if (field === "venue_id") {
            setFormData((prev) => ({
                ...prev,
                court_id: undefined,
            }));
        }

        if (field === "user_id") {
            setFormData((prev) => ({
                ...prev,
                booking_id: undefined,
            }));
        }
    };

    // Handle user selection
    const handleUserSelect = (user: UserOption) => {
        setSelectedUser(user);
        setFormData((prev) => ({
            ...prev,
            user_id: user.user_id,
        }));
        setUserSearch(user.fullname || user.username);
        setShowUserDropdown(false);
    };

    if (loading) {
        return (
            <DashboardLayout activeTab="feedbacks">
                <LoadingSpinner message="Đang tải dữ liệu..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeTab="feedbacks">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/dashboard/feedbacks")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Thêm phản hồi mới
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Tạo phản hồi mới cho khách hàng
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* User Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Chọn người dùng
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Label htmlFor="user-search">
                                            Tìm kiếm người dùng
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="user-search"
                                                value={userSearch}
                                                onChange={(e) => {
                                                    setUserSearch(
                                                        e.target.value
                                                    );
                                                    setShowUserDropdown(true);
                                                }}
                                                onFocus={() =>
                                                    setShowUserDropdown(true)
                                                }
                                                placeholder="Tìm theo tên, username hoặc email..."
                                                className={`pl-10 ${
                                                    errors.user_id
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>

                                        {showUserDropdown &&
                                            filteredUsers.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredUsers.map(
                                                        (user) => (
                                                            <div
                                                                key={
                                                                    user.user_id
                                                                }
                                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                                onClick={() =>
                                                                    handleUserSelect(
                                                                        user
                                                                    )
                                                                }
                                                            >
                                                                <Avatar className="h-8 w-8">
                                                                    {/* ✅ Conditional rendering cho AvatarImage */}
                                                                    {getImageUrl(
                                                                        user.avatar
                                                                    ) && (
                                                                        <AvatarImage
                                                                            src={getImageUrl(
                                                                                user.avatar
                                                                            )}
                                                                            alt={
                                                                                user.fullname ||
                                                                                user.username
                                                                            }
                                                                        />
                                                                    )}
                                                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                                        {getInitials(
                                                                            user.fullname ||
                                                                                user.username
                                                                        )}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {user.fullname ||
                                                                            user.username}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {
                                                                            user.email
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        {errors.user_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.user_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Selected User Display */}
                                    {selectedUser && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    {/* ✅ Conditional rendering cho AvatarImage */}
                                                    {getImageUrl(
                                                        selectedUser.avatar
                                                    ) && (
                                                        <AvatarImage
                                                            src={getImageUrl(
                                                                selectedUser.avatar
                                                            )}
                                                            alt={
                                                                selectedUser.fullname ||
                                                                selectedUser.username
                                                            }
                                                        />
                                                    )}
                                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                                        {getInitials(
                                                            selectedUser.fullname ||
                                                                selectedUser.username
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-blue-900">
                                                        {selectedUser.fullname ||
                                                            selectedUser.username}
                                                    </h3>
                                                    <p className="text-blue-700 text-sm">
                                                        {selectedUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Rating & Comment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5" />
                                        Đánh giá và phản hồi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Rating */}
                                    <div>
                                        <Label htmlFor="rating">
                                            Đánh giá (1-5 sao)
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={formData.rating.toString()}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "rating",
                                                    parseInt(value)
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.rating
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className="h-4 w-4 text-yellow-400 fill-current"
                                                                />
                                                            ))}
                                                        </div>
                                                        <span>
                                                            5 sao - Rất hài lòng
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < 4
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span>
                                                            4 sao - Hài lòng
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < 3
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span>
                                                            3 sao - Bình thường
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < 2
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span>
                                                            2 sao - Không hài
                                                            lòng
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i < 1
                                                                            ? "text-yellow-400 fill-current"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span>
                                                            1 sao - Rất không
                                                            hài lòng
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.rating && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.rating}
                                            </p>
                                        )}
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <Label htmlFor="comment">
                                            Nội dung phản hồi
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        </Label>
                                        <Textarea
                                            id="comment"
                                            value={formData.comment}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "comment",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nhập nội dung phản hồi của khách hàng..."
                                            rows={6}
                                            className={
                                                errors.comment
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {errors.comment && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.comment}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.comment.length}/1000 ký tự
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location & Booking Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Thông tin liên quan (tùy chọn)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Venue */}
                                        <div>
                                            <Label htmlFor="venue">
                                                Địa điểm
                                            </Label>
                                            <Select
                                                value={
                                                    formData.venue_id?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        "venue_id",
                                                        value
                                                            ? parseInt(value)
                                                            : undefined
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn địa điểm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">
                                                        Không chọn
                                                    </SelectItem>
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

                                        {/* Court */}
                                        <div>
                                            <Label htmlFor="court">Sân</Label>
                                            <Select
                                                value={
                                                    formData.court_id?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        "court_id",
                                                        value
                                                            ? parseInt(value)
                                                            : undefined
                                                    )
                                                }
                                                disabled={!formData.venue_id}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn sân" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">
                                                        Không chọn
                                                    </SelectItem>
                                                    {courts.map((court) => (
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
                                    </div>

                                    {/* Booking */}
                                    {formData.user_id > 0 && (
                                        <div>
                                            <Label htmlFor="booking">
                                                Liên kết với booking
                                            </Label>
                                            <Select
                                                value={
                                                    formData.booking_id?.toString() ||
                                                    ""
                                                }
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        "booking_id",
                                                        value
                                                            ? parseInt(value)
                                                            : undefined
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn booking" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">
                                                        Không chọn
                                                    </SelectItem>
                                                    {bookings.map((booking) => (
                                                        <SelectItem
                                                            key={
                                                                booking.booking_id
                                                            }
                                                            value={booking.booking_id.toString()}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>
                                                                    {format(
                                                                        new Date(
                                                                            booking.booking_date
                                                                        ),
                                                                        "dd/MM/yyyy",
                                                                        {
                                                                            locale: vi,
                                                                        }
                                                                    )}{" "}
                                                                    •
                                                                    {
                                                                        booking.start_time
                                                                    }
                                                                    -
                                                                    {
                                                                        booking.end_time
                                                                    }{" "}
                                                                    •
                                                                    {
                                                                        booking.court_name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hành động</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4 mr-2" />
                                        )}
                                        Tạo phản hồi
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            router.push("/dashboard/feedbacks")
                                        }
                                        disabled={saving}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Hủy bỏ
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Preview */}
                            {formData.rating > 0 && formData.comment && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Xem trước</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Rating Preview */}
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Đánh giá
                                            </Label>
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: 5 }).map(
                                                    (_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i <
                                                                formData.rating
                                                                    ? "text-yellow-400 fill-current"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    )
                                                )}
                                                <span className="text-sm text-gray-600 ml-1">
                                                    {formData.rating}/5
                                                </span>
                                            </div>
                                        </div>

                                        {/* Comment Preview */}
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Nội dung
                                            </Label>
                                            <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 max-h-24 overflow-y-auto">
                                                {formData.comment}
                                            </div>
                                        </div>

                                        {/* User Preview */}
                                        {selectedUser && (
                                            <div>
                                                <Label className="text-sm font-medium">
                                                    Người dùng
                                                </Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Avatar className="h-6 w-6">
                                                        {/* ✅ Conditional rendering cho AvatarImage */}
                                                        {getImageUrl(
                                                            selectedUser.avatar
                                                        ) && (
                                                            <AvatarImage
                                                                src={getImageUrl(
                                                                    selectedUser.avatar
                                                                )}
                                                                alt={
                                                                    selectedUser.fullname ||
                                                                    selectedUser.username
                                                                }
                                                            />
                                                        )}
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                            {getInitials(
                                                                selectedUser.fullname ||
                                                                    selectedUser.username
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-700">
                                                        {selectedUser.fullname ||
                                                            selectedUser.username}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Hướng dẫn
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-gray-600 space-y-2">
                                    <p>
                                        • Chọn người dùng từ danh sách khách
                                        hàng
                                    </p>
                                    <p>
                                        • Đánh giá từ 1-5 sao theo mức độ hài
                                        lòng
                                    </p>
                                    <p>• Nhập nội dung phản hồi chi tiết</p>
                                    <p>
                                        • Có thể liên kết với địa điểm và
                                        booking cụ thể
                                    </p>
                                    <p>
                                        • Phản hồi sẽ được tạo với trạng thái
                                        &quot;Chờ duyệt&quot;
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
