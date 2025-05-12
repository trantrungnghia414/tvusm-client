"use client";

import { cn } from "lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { signIn } from "next-auth/react"; // Thêm import này

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false); // Thêm state mới
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // Thay đổi phần xử lý response
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier || !password) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        setLoading(true);

        try {
            // Xác định xem identifier là email hay username
            const isEmail = identifier.includes("@");

            // Nếu là email thì chuyển thành chữ thường, nếu là username thì giữ nguyên
            const loginValue = isEmail ? identifier.toLowerCase() : identifier;

            const response = await fetchApi("/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: loginValue,
                    password,
                }),
            });

            // Đọc response body một lần duy nhất và lưu vào biến
            const responseText = await response.text();
            let data;

            try {
                // Thử parse text thành JSON
                data = JSON.parse(responseText);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                // Nếu không phải JSON, và response OK, có thể là token
                if (response.ok) {
                    data = { access_token: responseText };
                } else {
                    toast.error("Định dạng dữ liệu không hợp lệ");
                    setLoading(false);
                    return;
                }
            }

            // Xử lý khi response không OK
            if (!response.ok) {
                // Đã có data từ responseText, không cần đọc response.json() nữa

                // Kiểm tra nếu tài khoản bị khóa
                if (
                    (response.status === 401 &&
                        data.message?.includes("bị tạm khóa")) ||
                    data.message?.includes("bị cấm")
                ) {
                    toast.error(data.message, { duration: 5000 });
                    setLoading(false);
                    return;
                }

                // Xử lý các trường hợp lỗi cụ thể
                if (response.status === 404) {
                    toast.error("Sai tên đăng nhập hoặc mật khẩu!");
                    setLoading(false);
                    return;
                }

                if (response.status === 401) {
                    // Kiểm tra nếu mật khẩu không đúng
                    if (
                        data.message?.includes("Invalid password") ||
                        data.message?.includes("Mật khẩu không đúng")
                    ) {
                        toast.error("Mật khẩu không đúng");
                        setLoading(false);
                        return;
                    }

                    // Kiểm tra nếu tài khoản chưa xác thực
                    if (
                        data.message?.includes("verify your email") ||
                        data.message?.includes("chưa được xác thực")
                    ) {
                        toast.error("Tài khoản chưa được xác thực", {
                            duration: 3000,
                        });

                        // Lấy email từ response
                        const emailToVerify = data.email;

                        if (!emailToVerify) {
                            toast.error("Không thể xác định email để xác thực");
                            setLoading(false);
                            return;
                        }

                        // Chuyển hướng đến trang xác thực
                        setTimeout(() => {
                            router.push(
                                `/verify-code?email=${encodeURIComponent(
                                    emailToVerify
                                )}`
                            );
                        }, 2000);
                        return;
                    }
                }

                // Xử lý các lỗi khác
                toast.error(data.message || "Đăng nhập thất bại");
                setLoading(false);
                return;
            }

            // Đăng nhập thành công
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                toast.success("Đăng nhập thành công!");

                // Lấy thông tin người dùng
                try {
                    const profileResponse = await fetchApi("/users/profile", {
                        headers: {
                            Authorization: `Bearer ${data.access_token}`,
                        },
                    });

                    if (!profileResponse.ok) {
                        throw new Error("Không thể lấy thông tin người dùng");
                    }

                    const profileData = await profileResponse.json();

                    // Chuyển hướng dựa theo role
                    setTimeout(() => {
                        if (profileData.role === "admin") {
                            window.location.href = "/dashboard";
                        } else {
                            window.location.href = "/";
                        }
                    }, 1000);
                } catch (profileError) {
                    console.error("Profile fetch error:", profileError);
                    // Mặc dù không lấy được thông tin profile, vẫn chuyển hướng về trang chủ
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 1000);
                }
            } else {
                toast.error("Token không hợp lệ");
                setLoading(false);
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(
                error instanceof Error ? error.message : "Đăng nhập thất bại"
            );
            setLoading(false);
        }
    };

    // Thêm hàm mới này để xử lý đăng nhập bằng Google
    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);

            const result = await signIn("google", {
                callbackUrl: `${window.location.origin}?googleLogin=true`,
                redirect: false,
            });

            if (result?.error) {
                toast.error("Đăng nhập bằng Google thất bại");
            } else {
                toast.success("Đăng nhập thành công!");
                // Không cần redirect vì đã xử lý trong callback của NextAuth
            }
        } catch (error) {
            console.error("Google login error:", error);
            toast.error("Đăng nhập bằng Google thất bại");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Đăng nhập</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="identifier">
                                    Tên đăng nhập
                                </Label>
                                <Input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                    }}
                                    required
                                    placeholder="Nhập tên đăng nhập hoặc email"
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <a
                                        href="/forgot-password"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>
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
                                        placeholder="Nhập mật khẩu"
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
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Đang đăng nhập..."
                                        : "Đăng nhập"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full cursor-pointer flex items-center justify-center gap-2"
                                    disabled={loading || googleLoading}
                                    onClick={handleGoogleLogin}
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
                            Chưa có tài khoản?{" "}
                            <a
                                href="register"
                                className="underline underline-offset-4"
                            >
                                Đăng ký
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
