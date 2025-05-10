import React, { useState, useEffect, useRef } from "react";
import { User } from "../types/userTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UserFormProps {
    user?: User;
    isEditMode?: boolean;
}

export default function UserForm({ user, isEditMode = false }: UserFormProps) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("customer");
    const [isActive, setIsActive] = useState(true);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [fullnameError, setFullnameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Nếu là sửa, điền thông tin người dùng vào form
    useEffect(() => {
        if (isEditMode && user) {
            setUsername(user.username);
            setEmail(user.email);
            setFullname(user.fullname);
            setPhone(user.phone || "");
            setRole(user.role);
            setIsActive(user.status === "active");
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user, isEditMode]);

    // Xác thực form
    const validateForm = () => {
        let isValid = true;

        // Xác thực username
        if (!username.trim()) {
            setUsernameError("Tên đăng nhập không được để trống");
            isValid = false;
        } else if (username.length < 5) {
            setUsernameError("Tên đăng nhập phải có ít nhất 5 ký tự");
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsernameError(
                "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
            );
            isValid = false;
        } else {
            setUsernameError("");
        }

        // Xác thực email
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            isValid = false;
        } else if (!email.includes("@") || !email.includes(".")) {
            setEmailError("Email không hợp lệ");
            isValid = false;
        } else {
            setEmailError("");
        }

        // Xác thực họ tên
        if (!fullname.trim()) {
            setFullnameError("Họ và tên không được để trống");
            isValid = false;
        } else if (fullname.trim().length < 3) {
            setFullnameError("Họ và tên phải có ít nhất 3 ký tự");
            isValid = false;
        } else {
            setFullnameError("");
        }

        // Xác thực số điện thoại (nếu có)
        if (phone && !/^0\d{9}$/.test(phone)) {
            setPhoneError("Số điện thoại phải bắt đầu bằng 0 và có 10 số");
            isValid = false;
        } else {
            setPhoneError("");
        }

        // Xác thực mật khẩu (chỉ khi tạo mới)
        if (!isEditMode) {
            if (!password) {
                setPasswordError("Mật khẩu không được để trống");
                isValid = false;
            } else if (password.length < 8) {
                setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
                isValid = false;
            } else {
                setPasswordError("");
            }
        }

        return isValid;
    };

    // Xử lý khi người dùng chọn file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước file (tối đa 2MB)
        if (file.size > 2 * 1024 * 1024) {
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

    // Hàm lấy chữ cái đầu tiên của tên để hiển thị avatar
    const getInitials = (name: string) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Xử lý khi submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("fullname", fullname);
            if (phone) formData.append("phone", phone);
            formData.append("role", role);
            formData.append("status", isActive ? "active" : "inactive");
            if (!isEditMode) formData.append("password", password);
            if (avatarFile) formData.append("avatar", avatarFile);

            let url = "/admin/users";
            let method = "POST";

            if (isEditMode && user) {
                url = `/admin/users/${user.id}`;
                method = "PUT";
            }

            // Trong thực tế, gọi API để lưu dữ liệu
            // const response = await fetchApi(url, {
            //     method,
            //     headers: {
            //         Authorization: `Bearer ${localStorage.getItem("token")}`
            //     },
            //     body: formData,
            // });

            // Giả lập API call thành công
            setTimeout(() => {
                toast.success(
                    isEditMode
                        ? "Cập nhật người dùng thành công"
                        : "Thêm người dùng thành công"
                );
                router.push("/dashboard/users");
            }, 1000);
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error(
                isEditMode
                    ? "Không thể cập nhật người dùng"
                    : "Không thể thêm người dùng"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditMode
                        ? "Chỉnh sửa người dùng"
                        : "Thêm người dùng mới"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex justify-center mb-6">
                        <div className="space-y-4">
                            <Avatar
                                className="h-24 w-24 mx-auto cursor-pointer"
                                onClick={handleSelectImage}
                            >
                                {avatarPreview ? (
                                    <AvatarImage
                                        src={avatarPreview}
                                        alt="Preview"
                                    />
                                ) : (
                                    <AvatarFallback className="text-2xl">
                                        {fullname ? getInitials(fullname) : "?"}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSelectImage}
                                >
                                    Chọn ảnh
                                </Button>
                                {avatarPreview && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={handleClearImage}
                                    >
                                        Xóa
                                    </Button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Họ và tên */}
                        <div className="space-y-2">
                            <Label htmlFor="fullname">
                                Họ và tên{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="fullname"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                placeholder="Nhập họ và tên đầy đủ"
                                className={
                                    fullnameError ? "border-red-500" : ""
                                }
                            />
                            {fullnameError && (
                                <p className="text-sm text-red-500">
                                    {fullnameError}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                className={emailError ? "border-red-500" : ""}
                                disabled={isEditMode} // Không cho phép sửa email khi đang sửa
                            />
                            {emailError && (
                                <p className="text-sm text-red-500">
                                    {emailError}
                                </p>
                            )}
                            {isEditMode && (
                                <p className="text-xs text-gray-500">
                                    Email không thể thay đổi
                                </p>
                            )}
                        </div>

                        {/* Tên đăng nhập */}
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Tên đăng nhập{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tên đăng nhập"
                                className={
                                    usernameError ? "border-red-500" : ""
                                }
                                disabled={isEditMode} // Không cho phép sửa username khi đang sửa
                            />
                            {usernameError && (
                                <p className="text-sm text-red-500">
                                    {usernameError}
                                </p>
                            )}
                            {isEditMode && (
                                <p className="text-xs text-gray-500">
                                    Tên đăng nhập không thể thay đổi
                                </p>
                            )}
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại"
                                type="tel"
                                className={phoneError ? "border-red-500" : ""}
                            />
                            {phoneError && (
                                <p className="text-sm text-red-500">
                                    {phoneError}
                                </p>
                            )}
                        </div>

                        {/* Mật khẩu - chỉ hiển thị khi tạo mới */}
                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Mật khẩu{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Nhập mật khẩu"
                                        className={
                                            passwordError
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-sm text-red-500">
                                        {passwordError}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Mật khẩu phải có ít nhất 8 ký tự
                                </p>
                            </div>
                        )}

                        {/* Vai trò */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Vai trò <span className="text-red-500">*</span>
                            </Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        Quản trị viên
                                    </SelectItem>
                                    <SelectItem value="manager">
                                        Quản lý
                                    </SelectItem>
                                    <SelectItem value="customer">
                                        Khách hàng
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Trạng thái */}
                        <div className="flex items-center justify-between space-y-0 pt-4">
                            <Label htmlFor="user-status">
                                Trạng thái hoạt động
                            </Label>
                            <Switch
                                id="user-status"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                        </div>
                    </div>

                    {/* Nút lưu và hủy */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/users")}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving
                                ? "Đang lưu..."
                                : isEditMode
                                ? "Cập nhật"
                                : "Thêm mới"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
