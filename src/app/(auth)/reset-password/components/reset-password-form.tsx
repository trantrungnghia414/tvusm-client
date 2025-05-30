"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, X } from "lucide-react";
import { fetchApi } from "@/lib/api";

export function ResetPasswordForm() {
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code) {
            toast.error("Vui lòng nhập mã xác thực");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password.length < 8) {
            toast.error("Mật khẩu phải có ít nhất 8 ký tự");
            return;
        }

        if (passwordStrength < 75) {
            toast.error(
                "Mật khẩu quá yếu. Cần có chữ hoa, chữ thường, số hoặc ký tự đặc biệt!"
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetchApi("/users/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    code,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Có lỗi xảy ra");
            }

            toast.success("Đặt lại mật khẩu thành công");

            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Có lỗi xảy ra khi đặt lại mật khẩu"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <Card>
                <CardContent>
                    <p className="text-center text-red-500">
                        Không tìm thấy email. Vui lòng thử lại từ trang quên mật
                        khẩu.
                    </p>
                    <div className="mt-4 text-center">
                        <a
                            href="/forgot-password"
                            className="text-sm underline underline-offset-4"
                        >
                            Quay lại trang quên mật khẩu
                        </a>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Đặt lại mật khẩu</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <p className="text-sm text-gray-500">{email}</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="code">Mã xác thực</Label>
                            <Input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Nhập mã đã gửi đến email của bạn"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Mã xác thực có hiệu lực trong 15 phút
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Nhập mật khẩu mới"
                                    required
                                    minLength={8}
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
                            {passwordStrength < 75 && password && (
                                <p className="text-xs text-gray-500">
                                    Mật khẩu cần có chữ hoa, chữ thường, và số
                                    hoặc ký tự đặc biệt
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">
                                Xác nhận mật khẩu
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
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Nhập lại mật khẩu mới"
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
                            {confirmPassword &&
                                password &&
                                confirmPassword !== password && (
                                    <div className="flex items-center gap-1 text-red-500 text-sm">
                                        <X className="h-4 w-4" /> Mật khẩu xác
                                        nhận không khớp
                                    </div>
                                )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <a
                            href="/login"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Quay lại đăng nhập
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
