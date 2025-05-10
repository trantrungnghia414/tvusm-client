"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Shield,
    CheckCircle,
    Eye,
    EyeOff,
    X,
    Camera,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
    user_id: number;
    username: string;
    fullname?: string;
    email: string;
    phone?: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    avatar?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

    // Form fields
    const [fullname, setFullname] = useState("");
    const [fullnameError, setFullnameError] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // Password change fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Vui lòng đăng nhập để tiếp tục");
                    router.push("/login");
                    return;
                }

                const response = await fetchApi("/users/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Không thể lấy thông tin người dùng");
                }

                const data = await response.json();
                setUserProfile(data);

                // Populate form fields
                setFullname(data.fullname || "");
                setEmail(data.email || "");
                setPhone(data.phone || "");
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast.error("Không thể tải thông tin cá nhân");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    // Kiểm tra độ mạnh của mật khẩu
    useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        // Độ dài ít nhất 8 ký tự
        if (newPassword.length >= 8) strength += 25;
        // Có chữ thường
        if (/[a-z]/.test(newPassword)) strength += 25;
        // Có chữ hoa
        if (/[A-Z]/.test(newPassword)) strength += 25;
        // Có số hoặc ký tự đặc biệt
        if (/[0-9!@#$%^&*]/.test(newPassword)) strength += 25;

        setPasswordStrength(strength);
    }, [newPassword]);

    // Xác thực họ tên
    const validateFullname = () => {
        if (!fullname.trim()) {
            setFullnameError("Họ và tên không được để trống");
            return false;
        }

        if (fullname.trim().length < 3) {
            setFullnameError("Họ và tên phải có ít nhất 3 ký tự");
            return false;
        }

        if (fullname.trim().length > 50) {
            setFullnameError("Họ và tên không được vượt quá 50 ký tự");
            return false;
        }

        // Kiểm tra có chứa chỉ có chữ cái, khoảng trắng và dấu
        if (!/^[A-Za-zÀ-ỹ\s]+$/.test(fullname)) {
            setFullnameError("Họ và tên chỉ được chứa chữ cái và khoảng trắng");
            return false;
        }

        setFullnameError("");
        return true;
    };

    // Xác thực số điện thoại
    const validatePhone = () => {
        if (!phone) {
            // Số điện thoại có thể để trống
            setPhoneError("");
            return true;
        }

        if (!/^0\d{9}$/.test(phone)) {
            setPhoneError(
                "Số điện thoại phải bắt đầu bằng số 0 và có đúng 10 số"
            );
            return false;
        }

        setPhoneError("");
        return true;
    };

    // Xử lý khi người dùng chọn tệp ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước file (tối đa 2MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 2MB");
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
            toast.error("Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF");
            return;
        }

        // Lưu file và tạo URL xem trước
        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    };

    // Mở dialog chọn ảnh khi click vào avatar
    const handleAvatarClick = () => {
        setAvatarDialogOpen(true);
    };

    // Xử lý khi click vào nút "Chọn ảnh"
    const handleSelectImage = () => {
        fileInputRef.current?.click();
    };

    // Xử lý khi click vào nút "Xóa"
    const handleClearImage = () => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Xác thực thông tin trước khi gửi
        const isFullnameValid = validateFullname();
        const isPhoneValid = validatePhone();

        if (!isFullnameValid || !isPhoneValid) {
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

            let response;

            if (avatarFile) {
                // Nếu có ảnh mới, sử dụng FormData để gửi cả ảnh và dữ liệu
                const formData = new FormData();
                formData.append("fullname", fullname);
                formData.append("phone", phone || "");
                formData.append("avatar", avatarFile);

                response = await fetchApi(`/users/${userProfile?.user_id}`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });
            } else {
                // Nếu không có ảnh mới, chỉ gửi dữ liệu JSON
                const updateData = {
                    fullname,
                    phone,
                };

                response = await fetchApi(`/users/${userProfile?.user_id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateData),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể cập nhật thông tin"
                );
            }

            const updatedProfile = await response.json();
            setUserProfile({
                ...userProfile!,
                ...updatedProfile,
            });

            // Xóa ảnh preview và file sau khi cập nhật thành công
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }
            setAvatarFile(null);

            toast.success("Cập nhật thông tin thành công");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật thông tin"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset error
        setCurrentPasswordError("");

        // Validate passwords
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
            return;
        }

        if (passwordStrength < 75) {
            toast.error(
                "Mật khẩu quá yếu. Cần có chữ hoa, chữ thường, số hoặc ký tự đặc biệt!"
            );
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

            const passwordData = {
                currentPassword,
                newPassword,
            };

            const response = await fetchApi(
                `/users/${userProfile?.user_id}/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(passwordData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();

                // Kiểm tra nếu lỗi là do mật khẩu hiện tại không đúng
                if (
                    errorData.message &&
                    errorData.message.includes("hiện tại không đúng")
                ) {
                    setCurrentPasswordError("Mật khẩu hiện tại không đúng");
                    throw new Error("Mật khẩu hiện tại không đúng");
                }

                throw new Error(
                    errorData.message || "Không thể cập nhật mật khẩu"
                );
            }

            toast.success("Đổi mật khẩu thành công");

            // Reset form
            setCurrentPassword("");
            setCurrentPasswordError("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordStrength(0);
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Không thể đổi mật khẩu"
            );
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        Quản trị viên
                    </Badge>
                );
            case "manager":
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        Quản lý
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Khách hàng
                    </Badge>
                );
        }
    };

    // Thêm hàm helper để xử lý đường dẫn ảnh
    const getImageUrl = (path: string | undefined) => {
        if (!path) return null;

        // Nếu đường dẫn đã là URL đầy đủ, giữ nguyên
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Nếu đường dẫn bắt đầu bằng /uploads, thêm domain của server
        return `http://localhost:3000${path}`;
    };

    // Lấy màu và phần trăm cho hiển thị độ mạnh password
    const getPasswordStrengthTextColor = () => {
        if (passwordStrength <= 25) return "text-red-500";
        if (passwordStrength <= 50) return "text-orange-500";
        if (passwordStrength <= 75) return "text-yellow-500";
        return "text-green-500";
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 25) return "Yếu";
        if (passwordStrength <= 50) return "Trung bình";
        if (passwordStrength <= 75) return "Khá";
        return "Mạnh";
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">
                        Đang tải thông tin cá nhân...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Quay lại
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Hồ sơ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <div
                                className="relative cursor-pointer group"
                                onClick={handleAvatarClick}
                            >
                                <Avatar className="h-24 w-24 mb-4 ring-2 ring-offset-2 ring-primary shadow-md">
                                    {avatarPreview ? (
                                        <AvatarImage
                                            src={avatarPreview}
                                            alt="Preview"
                                        />
                                    ) : userProfile?.avatar ? (
                                        <AvatarImage
                                            src={
                                                getImageUrl(
                                                    userProfile?.avatar
                                                ) ?? undefined
                                            }
                                            alt={userProfile.username}
                                        />
                                    ) : null}
                                    <AvatarFallback className="text-2xl">
                                        {userProfile
                                            ? getInitials(
                                                  userProfile.fullname ||
                                                      userProfile.username
                                              )
                                            : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center rounded-full h-24 w-24 top-0 left-1/2 -translate-x-1/2 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-1">
                                {userProfile?.fullname || userProfile?.username}
                            </h2>
                            <div className="mb-2">
                                {getRoleBadge(userProfile?.role || "customer")}
                            </div>

                            <div className="w-full space-y-3 mt-4">
                                <div className="flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                        {userProfile?.username}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                        {userProfile?.email}
                                    </span>
                                </div>
                                {userProfile?.phone && (
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="text-sm">
                                            {userProfile.phone}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                        Tham gia:{" "}
                                        {userProfile?.created_at
                                            ? new Date(
                                                  userProfile.created_at
                                              ).toLocaleDateString("vi-VN")
                                            : "Không xác định"}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">
                                        {userProfile?.is_verified ? (
                                            <span className="text-green-600 flex items-center">
                                                <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                                Đã xác thực
                                            </span>
                                        ) : (
                                            <span className="text-orange-600">
                                                Chưa xác thực
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Quản lý tài khoản</CardTitle>
                        <CardDescription>
                            Cập nhật thông tin cá nhân và thay đổi mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="profile">
                            <TabsList className="mb-4">
                                <TabsTrigger value="profile">
                                    Thông tin cá nhân
                                </TabsTrigger>
                                <TabsTrigger value="password">
                                    Đổi mật khẩu
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="space-y-4">
                                        {avatarPreview && (
                                            <div className="grid gap-2">
                                                <Label>Ảnh đại diện mới</Label>
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage
                                                            src={avatarPreview}
                                                            alt="Preview"
                                                        />
                                                        <AvatarFallback>
                                                            {userProfile
                                                                ? getInitials(
                                                                      userProfile.fullname ||
                                                                          userProfile.username
                                                                  )
                                                                : "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={
                                                            handleClearImage
                                                        }
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Ảnh mới sẽ được cập nhật khi
                                                    bạn lưu thay đổi
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid gap-2">
                                            <Label htmlFor="fullname">
                                                Họ và tên
                                            </Label>
                                            <Input
                                                id="fullname"
                                                value={fullname}
                                                onChange={(e) => {
                                                    setFullname(e.target.value);
                                                    setFullnameError("");
                                                }}
                                                placeholder="Nhập họ và tên"
                                                className={
                                                    fullnameError
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {fullnameError && (
                                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                                    <X className="h-4 w-4" />{" "}
                                                    {fullnameError}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                value={email}
                                                disabled
                                                className="bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Email không thể thay đổi
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Số điện thoại
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={phone}
                                                onChange={(e) => {
                                                    setPhone(e.target.value);
                                                    setPhoneError("");
                                                }}
                                                placeholder="Nhập số điện thoại"
                                                type="tel"
                                                className={
                                                    phoneError
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            />
                                            {phoneError && (
                                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                                    <X className="h-4 w-4" />{" "}
                                                    {phoneError}
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full"
                                        >
                                            {saving
                                                ? "Đang lưu..."
                                                : "Lưu thay đổi"}
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="password">
                                <form onSubmit={handleChangePassword}>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current-password">
                                                Mật khẩu hiện tại
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="current-password"
                                                    type={
                                                        showCurrentPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={currentPassword}
                                                    onChange={(e) => {
                                                        setCurrentPassword(
                                                            e.target.value
                                                        );
                                                        setCurrentPasswordError(
                                                            ""
                                                        );
                                                    }}
                                                    placeholder="Nhập mật khẩu hiện tại"
                                                    required
                                                    className={
                                                        currentPasswordError
                                                            ? "border-red-500"
                                                            : ""
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword
                                                        )
                                                    }
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            {currentPasswordError && (
                                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                                    <X className="h-4 w-4" />{" "}
                                                    {currentPasswordError}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="new-password">
                                                Mật khẩu mới
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="new-password"
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={newPassword}
                                                    onChange={(e) =>
                                                        setNewPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Nhập mật khẩu mới"
                                                    required
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword
                                                        )
                                                    }
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            {newPassword && (
                                                <p
                                                    className={`text-xs ${getPasswordStrengthTextColor()}`}
                                                >
                                                    Độ mạnh:{" "}
                                                    {getPasswordStrengthText()}
                                                </p>
                                            )}
                                            {passwordStrength < 75 &&
                                                newPassword && (
                                                    <p className="text-xs text-gray-500">
                                                        Mật khẩu cần có chữ hoa,
                                                        chữ thường, và số hoặc
                                                        ký tự đặc biệt
                                                    </p>
                                                )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="confirm-password">
                                                Xác nhận mật khẩu mới
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirm-password"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={confirmPassword}
                                                    onChange={(e) =>
                                                        setConfirmPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={16} />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            {confirmPassword &&
                                                newPassword &&
                                                confirmPassword !==
                                                    newPassword && (
                                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                                        <X className="h-4 w-4" />{" "}
                                                        Mật khẩu xác nhận không
                                                        khớp
                                                    </div>
                                                )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full"
                                        >
                                            {saving
                                                ? "Đang xử lý..."
                                                : "Đổi mật khẩu"}
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog chọn ảnh đại diện */}
            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
                        <DialogDescription>
                            Chọn ảnh đại diện mới của bạn. Chỉ chấp nhận file
                            ảnh JPG, PNG hoặc GIF dưới 2MB.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Avatar className="h-32 w-32">
                                {avatarPreview ? (
                                    <AvatarImage
                                        src={avatarPreview}
                                        alt="Preview"
                                    />
                                ) : userProfile?.avatar ? (
                                    <AvatarImage
                                        src={
                                            getImageUrl(userProfile?.avatar) ??
                                            undefined
                                        }
                                        alt={userProfile.username}
                                    />
                                ) : null}
                                <AvatarFallback className="text-4xl">
                                    {userProfile
                                        ? getInitials(
                                              userProfile.fullname ||
                                                  userProfile.username
                                          )
                                        : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Button
                                type="button"
                                onClick={handleSelectImage}
                                className="min-w-[120px]"
                            >
                                Chọn ảnh
                            </Button>
                            {avatarPreview && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleClearImage}
                                    className="min-w-[120px]"
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                        <p className="text-center text-sm text-gray-500">
                            Ảnh đại diện sẽ được cập nhật khi bạn lưu thay đổi ở
                            trang thông tin cá nhân
                        </p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleFileChange}
                        />
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setAvatarDialogOpen(false)}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
