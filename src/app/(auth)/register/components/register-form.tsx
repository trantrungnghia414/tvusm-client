"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "lib/utils";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    const router = useRouter();

    // Kiểm tra độ mạnh của mật khẩu
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

    // Kiểm tra email - chuyển về lowercase để kiểm tra định dạng
    const emailLower = email.toLowerCase();

    // Kiểm tra đầu vào
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
        };

        // Kiểm tra email
        if (!emailLower.endsWith("@gmail.com")) {
            newErrors.email = "Email phải có đuôi @gmail.com";
            isValid = false;
        }

        // Kiểm tra username
        if (username.length < 5) {
            newErrors.username = "Tên đăng nhập phải có ít nhất 5 ký tự";
            isValid = false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username =
                "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
            isValid = false;
        }

        // Kiểm tra mật khẩu
        if (password.length < 8) {
            newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
            isValid = false;
        }

        if (passwordStrength < 75) {
            newErrors.password =
                "Mật khẩu chưa đủ mạnh (cần chữ hoa, chữ thường, số hoặc ký tự đặc biệt)";
            isValid = false;
        }

        // Kiểm tra xác nhận mật khẩu
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Kiểm tra đầu vào trước khi gửi request
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        email: emailLower.toLowerCase(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Đăng ký thất bại");
            }

            // Hiển thị thông báo thành công
            toast.success("Đăng ký thành công! Vui lòng xác thực email.");

            // Đợi hiển thị thông báo trước khi chuyển hướng
            setTimeout(() => {
                router.push(`/verify-code?email=${encodeURIComponent(email)}`);
            }, 2000);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : "Đăng ký thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Đăng ký tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Tên đăng nhập"
                                    required
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-500">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="password">Mật khẩu</Label>
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
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                {password && (
                                    <div>
                                        <p
                                            className={`text-xs ${getPasswordStrengthTextColor()}`}
                                        >
                                            Độ mạnh: {getPasswordStrengthText()}
                                        </p>
                                    </div>
                                )}
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="confirmPassword">
                                    Xác nhận mật khẩu
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
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full cursor-pointer"
                                    disabled={loading}
                                >
                                    Đăng nhập với Google
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Đã có tài khoản?{" "}
                            <a
                                href="login"
                                className="underline underline-offset-4"
                            >
                                Đăng nhập
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
