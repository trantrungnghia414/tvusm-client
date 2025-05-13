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
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

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
    const [confirmPassword, setConfirmPassword] = useState(""); // Thêm confirmPassword như form đăng ký
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Thêm showConfirmPassword
    const [passwordStrength, setPasswordStrength] = useState(0);

    const [fullnameError, setFullnameError] = useState("");

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

    // Đổi sang dạng errors như form đăng ký
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        fullname: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Thêm hàm getImageUrl để xử lý đường dẫn ảnh
    const getImageUrl = (path: string | undefined) => {
        if (!path) return null;

        // Nếu đường dẫn đã là URL đầy đủ, giữ nguyên
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        // Nếu đường dẫn bắt đầu bằng /uploads, thêm domain của server
        return `http://localhost:3000${path}`;
    };

    // Nếu là sửa, điền thông tin người dùng vào form
    useEffect(() => {
        if (isEditMode && user) {
            setUsername(user.username);
            setEmail(user.email);
            setFullname(user.fullname ?? "");
            setPhone(user.phone || "");
            setRole(user.role);
            setIsActive(user.status === "active");

            if (user.avatar) {
                setAvatarPreview(getImageUrl(user.avatar) || null);
            }
        }
    }, [user, isEditMode]);

    // Kiểm tra độ mạnh của mật khẩu - giống với form đăng ký
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        // Độ dài ít nhất 8 ký tự
        if (password.length >= 8) strength += 25;
        // Có chữ thường
        if (/[a-z]/.test(password)) strength += 25;
        // Có chữ hoa
        if (/[A-Z]/.test(password)) strength += 25;
        // Có số hoặc ký tự đặc biệt
        if (/[0-9!@#$%^&*]/.test(password)) strength += 25;

        setPasswordStrength(strength);
    }, [password]);

    // Lấy màu sắc dựa trên độ mạnh của mật khẩu - giống với form đăng ký
    const getPasswordStrengthTextColor = () => {
        if (passwordStrength <= 25) return "text-red-500";
        if (passwordStrength <= 50) return "text-orange-500";
        if (passwordStrength <= 75) return "text-yellow-500";
        return "text-green-500";
    };

    // Lấy trạng thái mật khẩu - giống với form đăng ký
    const getPasswordStrengthText = () => {
        if (passwordStrength <= 25) return "Yếu";
        if (passwordStrength <= 50) return "Trung bình";
        if (passwordStrength <= 75) return "Khá";
        return "Mạnh";
    };

    // Kiểm tra form - cập nhật để giống form đăng ký
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: "",
            username: "",
            fullname: "",
            phone: "",
            password: "",
            confirmPassword: "",
        };

        // Kiểm tra email - giống với đăng ký
        const emailLower = email.toLowerCase();
        if (!emailLower) {
            newErrors.email = "Email không được để trống";
            isValid = false;
        } else if (!emailLower.endsWith("@gmail.com")) {
            newErrors.email = "Email phải có đuôi @gmail.com";
            isValid = false;
        }

        // Kiểm tra username - giống với đăng ký
        if (!username.trim()) {
            newErrors.username = "Tên đăng nhập không được để trống";
            isValid = false;
        } else if (username.length < 5) {
            newErrors.username = "Tên đăng nhập phải có ít nhất 5 ký tự";
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username =
                "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
            isValid = false;
        }

        // Kiểm tra họ tên
        if (!fullname.trim()) {
            newErrors.fullname = "Họ và tên không được để trống";
            isValid = false;
        } else if (fullname.trim().length < 3) {
            newErrors.fullname = "Họ và tên phải có ít nhất 3 ký tự";
            isValid = false;
        }

        // Kiểm tra số điện thoại (nếu có)
        if (phone && !/^0\d{9}$/.test(phone)) {
            newErrors.phone = "Số điện thoại phải bắt đầu bằng 0 và có 10 số";
            isValid = false;
        }

        // Kiểm tra mật khẩu (chỉ khi tạo mới) - giống với đăng ký
        if (!isEditMode) {
            if (!password) {
                newErrors.password = "Mật khẩu không được để trống";
                isValid = false;
            } else if (password.length < 8) {
                newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
                isValid = false;
            } else if (passwordStrength < 75) {
                // newErrors.password =
                //     "Mật khẩu chưa đủ mạnh (cần chữ hoa, chữ thường, số hoặc ký tự đặc biệt)";
                // isValid = false;
                toast.error(
                    "Mật khẩu quá yếu. Cần có chữ hoa, chữ thường, số hoặc ký tự đặc biệt!"
                );
                return;
            }

            // Kiểm tra xác nhận mật khẩu - giống với đăng ký
            if (password !== confirmPassword) {
                newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    // Xử lý khi người dùng chọn file ảnh
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Kiểm tra kích thước file (tối đa 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh không được vượt quá 5MB");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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

        // Xác thực thông tin trước khi gửi
        const isFullnameValid = validateFullname();

        if (!isFullnameValid) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {
            // Kiểm tra kích thước file trước khi gửi lên server
            if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
                toast.error("Kích thước ảnh không được vượt quá 5MB");
                setSaving(false);
                return;
            }

            // Log dữ liệu trước khi gửi để debug
            console.log("Submitting user data:", {
                username,
                email: email.toLowerCase(), // Chuyển email về chữ thường trước khi gửi
                fullname,
                phone,
                role,
                isActive,
                hasPassword: !!password,
                hasAvatar: !!avatarFile,
            });

            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email.toLowerCase()); // Chuyển email về chữ thường
            formData.append("fullname", fullname);
            if (phone) formData.append("phone", phone);
            formData.append("role", role);

            // Chỉ gửi status khi là edit mode, không phải khi tạo mới
            if (isEditMode) {
                formData.append("status", isActive ? "active" : "inactive");
            }
            // Chỉ gửi password khi tạo mới
            if (!isEditMode) formData.append("password", password);
            if (avatarFile) formData.append("avatar", avatarFile);

            // Lấy token
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Phiên đăng nhập hết hạn");
                router.push("/login");
                return;
            }

            let url = "/users";
            let method = "POST";

            if (isEditMode && user) {
                url = `/users/${user.user_id}`;
                method = "PATCH"; // Hoặc PUT tùy vào API của bạn
            }

            console.log(`Sending request to ${url} with method ${method}`);

            // Gọi API để lưu dữ liệu
            const response = await fetchApi(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    // FormData sẽ tự động thiết lập Content-Type cho multipart/form-data
                },
                body: formData,
            });

            // Log response để debug
            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Không thể lưu thông tin người dùng"
                );
            }

            toast.success(
                isEditMode
                    ? "Cập nhật người dùng thành công"
                    : "Thêm người dùng thành công"
            );

            router.push("/dashboard/users");
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : isEditMode
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
                                className="h-24 w-24 mx-auto cursor-pointer mb-4 ring-2 ring-offset-2 ring-primary shadow-md"
                                onClick={handleSelectImage}
                            >
                                {avatarPreview ? (
                                    <AvatarImage
                                        src={avatarPreview}
                                        alt="Preview"
                                        className="object-cover"
                                        onError={(e) => {
                                            // Khi load ảnh thất bại, xóa src để hiển thị fallback
                                            e.currentTarget.src = "";
                                            // Tùy chọn: có thể set avatarPreview về null
                                            // setAvatarPreview(null);
                                        }}
                                    />
                                ) : null}
                                <AvatarFallback className="text-2xl">
                                    {fullname ? getInitials(fullname) : "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSelectImage}
                                >
                                    Chọn ảnh
                                </Button>
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
                                onChange={(e) => {
                                    setFullname(e.target.value);
                                    setFullnameError("");
                                }}
                                placeholder="Nhập họ và tên đầy đủ"
                                className={
                                    errors.fullname ? "border-red-500" : ""
                                }
                                required
                            />
                            {fullnameError && (
                                <div className="flex items-center gap-1 text-red-500 text-sm">
                                    <X className="h-4 w-4" /> {fullnameError}
                                </div>
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
                                className={errors.email ? "border-red-500" : ""}
                                disabled={isEditMode} // Không cho phép sửa email khi đang sửa
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email}
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
                                    errors.username ? "border-red-500" : ""
                                }
                                disabled={isEditMode} // Không cho phép sửa username khi đang sửa
                                required
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500">
                                    {errors.username}
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
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Mật khẩu - chỉ hiển thị khi tạo mới */}
                        {!isEditMode && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Mật khẩu{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="Nhập mật khẩu"
                                            className={
                                                errors.password
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                            required
                                            minLength={8}
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
                                    {/* {errors.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )} */}
                                    {password && (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p
                                                    className={`text-xs ${getPasswordStrengthTextColor()}`}
                                                >
                                                    Độ mạnh:{" "}
                                                    {getPasswordStrengthText()}
                                                </p>
                                            </div>
                                            {passwordStrength < 75 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Mật khẩu cần có chữ hoa, chữ
                                                    thường, và số hoặc ký tự đặc
                                                    biệt
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Xác nhận mật khẩu - thêm vào giống form đăng ký */}
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Xác nhận mật khẩu{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
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
                                            placeholder="Nhập lại mật khẩu"
                                            className={
                                                errors.confirmPassword
                                                    ? "border-red-500"
                                                    : ""
                                            }
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
                                        password &&
                                        confirmPassword !== password && (
                                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                                <X className="h-4 w-4" /> Mật
                                                khẩu xác nhận không khớp
                                            </div>
                                        )}
                                </div>
                            </>
                        )}

                        {/* Vai trò */}
                        <div className="space-y-2">
                            <Label htmlFor="role">
                                Vai trò <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={role}
                                onValueChange={setRole}
                                disabled={isEditMode && user?.role === "admin"} // Khóa dropdown role khi sửa admin
                            >
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
