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
import { fetchApi } from "@/lib/api";
import { signIn } from "next-auth/react";

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
    const [googleLoading, setGoogleLoading] = useState(false);
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
            const response = await fetchApi("/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email: emailLower.toLowerCase(),
                    password,
                }),
            });

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

    const handleGoogleSignup = async () => {
        try {
            setGoogleLoading(true);

            const result = await signIn("google", {
                callbackUrl: `${window.location.origin}?googleLogin=true`,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Đăng ký với Google thất bại");
            } else {
                toast.success("Đăng nhập thành công!");
                // Không cần redirect vì đã xử lý trong callback của NextAuth
            }
        } catch (error) {
            console.error("Google signup error:", error);
            toast.error("Đăng ký với Google thất bại");
        } finally {
            setGoogleLoading(false);
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
                                    type="button"
                                    variant="outline"
                                    className="w-full cursor-pointer flex items-center justify-center gap-2"
                                    disabled={loading || googleLoading}
                                    onClick={handleGoogleSignup}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                        className="mr-1"
                                    >
                                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                            <path
                                                fill="#4285F4"
                                                d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                                            />
                                        </g>
                                    </svg>
                                    {googleLoading
                                        ? "Đang xử lý..."
                                        : "Đăng nhập với Google"}
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
